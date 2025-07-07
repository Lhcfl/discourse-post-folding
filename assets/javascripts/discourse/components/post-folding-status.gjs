import Component from "@glimmer/component";
import RelativeDate from "discourse/components/relative-date";
import UserAvatar from "discourse/components/user-avatar";
import icon from "discourse/helpers/d-icon";

export default class PostFoldingStatus extends Component {
  static shouldRender(args) {
    return !args.state.collapsed && args.post.post_folding_status != null;
  }

  <template>
    <p class="post-folding-status-container">
      <div class="spacer"></div>
      <span class="icon">
        {{icon "compress"}}
      </span>
      <span class="user">
        <UserAvatar
          tabindex="-1"
          @lazy={{true}}
          @size="small"
          @user={{@post.post_folding_status.user}}
        />
      </span>
      <span class="date">
        <RelativeDate @date={{@post.post_folding_status.created_at}} />
      </span>
    </p>
  </template>
}
