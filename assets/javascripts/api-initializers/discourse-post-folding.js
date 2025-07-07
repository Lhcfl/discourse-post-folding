import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { apiInitializer } from "discourse/lib/api";
import { bind } from "discourse/lib/decorators";
import PostFoldingStatus from "../discourse/components/post-folding-status";
import PostMenuFoldingButton from "../discourse/components/post-menu-folding-button";

export default apiInitializer("1.16.0", (api) => {
  api.modifyClass(
    "controller:topic",
    (Superclass) =>
      class extends Superclass {
        subscribe() {
          super.subscribe(...arguments);
          this.messageBus.subscribe(
            `/discourse-post-folding/topic/${this.model.id}`,
            this._onPostFoldingMessage
          );
        }

        unsubscribe() {
          this.messageBus.unsubscribe(
            "/discourse-post-folding/topic/*",
            this._onPostFoldingMessage
          );
          super.unsubscribe(...arguments);
        }

        @bind
        _onPostFoldingMessage(msg) {
          const post = this.get("model.postStream").findLoadedPost(msg.post_id);
          post?.set("post_folding_status", msg.post_folding_status);
          // TODO (glimmer-post-stream) the Glimmer Post Stream does not listen to this event
          this.appEvents.trigger("post-stream:refresh", {
            id: msg.post_id,
            post_folding_status: msg.post_folding_status,
          });
        }
      }
  );

  api.addTrackedPostProperties("post_folding_status");

  api.addPostClassesCallback((attrs) => {
    if (attrs.post_folding_status == null) {
      return [];
    } else {
      return ["folded"];
    }
  });

  function shoudRenderPostFoldingButton(post) {
    const currentUser = api.getCurrentUser();

    let canFold = false;

    if (post.post_number === 1) {
      return;
    }
    if (currentUser == null) {
      return;
    }

    canFold ||= currentUser?.can_fold_post;
    canFold ||=
      post.topic?.topic_op_admin_status?.can_fold_posts &&
      currentUser.id === post.topic.user_id;

    return canFold;
  }

  function makeButton(attrs) {
    if (!shoudRenderPostFoldingButton(attrs)) {
      return;
    }

    const folded = attrs.post_folding_status != null;

    return {
      action: (post) => {
        if (post.post) {
          post = post.post;
        }
        ajax(`/discourse-post-folding/status/${post.id}`, {
          type: folded ? "DELETE" : "PUT",
          data: {},
        }).catch(popupAjaxError);
      },
      icon: folded ? "expand" : "compress",
      className: "discourse_post_folding-fold-btn",
      label: folded
        ? "discourse_post_folding.expand.title"
        : "discourse_post_folding.fold.title",
      position: "second-last-hidden",
    };
  }

  api.registerValueTransformer(
    "post-menu-buttons",
    ({
      value: dag,
      context: {
        post,
        lastHiddenButtonKey, // key of the last hidden button
      },
    }) => {
      if (post.canManage || post.canWiki || post.canEditStaffNotes) {
        return;
      }
      if (!shoudRenderPostFoldingButton(post)) {
        return;
      }
      dag.add("post-folding", PostMenuFoldingButton, {
        before: lastHiddenButtonKey,
      });
    }
  );

  api.renderAfterWrapperOutlet("post-menu", PostFoldingStatus);

  api.addPostAdminMenuButton((attrs) => {
    if (attrs.canManage || attrs.canWiki || attrs.canEditStaffNotes) {
      return makeButton(attrs);
    }
  });
});
