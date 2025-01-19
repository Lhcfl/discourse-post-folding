import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class PostMenuFoldingButton extends Component {
  // indicates if the button will be prompty displayed or hidden behind the show more button
  static hidden() {
    return true;
  }

  static shouldRender(args) {
    return args.post.post_number !== 1;
  }

  @service appEvents;

  get folded() {
    return this.args.post.post_folding_status;
  }

  get title() {
    return this.folded
      ? "discourse_post_folding.expand.title"
      : "discourse_post_folding.fold.title";
  }

  get icon() {
    return this.folded ? "expand" : "compress";
  }

  @action
  toggleFolded() {
    const post = this.args.post;
    ajax(`/discourse-post-folding/status/${post.id}`, {
      type: this.folded ? "DELETE" : "PUT",
      data: {},
    })
      .then((res) => {
        post.set("post_folding_status", res.post_folding_status);
        this.appEvents.trigger("post-stream:refresh", {
          id: post.id,
        });
      })
      .catch(popupAjaxError);
  }

  <template>
    <DButton
      class="discourse_post_folding-fold-btn"
      ...attributes
      @action={{this.toggleFolded}}
      @icon={{this.icon}}
      @title={{this.title}}
    />
  </template>
}
