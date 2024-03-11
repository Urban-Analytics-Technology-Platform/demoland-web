<script>
  import Fa from "svelte-fa";
  import { faPerson, faEllipsis } from "@fortawesome/free-solid-svg-icons";
  import { fade } from "svelte/transition";
  import Hal from "../../assets/hal.jpg";
  import Dave from "../../assets/dave.jpg";

  export let sentByMe;
  export let nameChatPartner;
  export let profilePicChatPartner;
  export let nameMe;
  export let profilePicMe;
  export let message;
  export let placeholder = false;
  export let timestamp;
</script>

<div
  transition:fade={{ delay: sentByMe ? 0 : 1000, duration: 500 }}
  class="direct-chat-msg"
  class:right={sentByMe}
  class:left={!sentByMe}
>
  <div class="direct-chat-infos clearfix">
    <!-- 	No point in showing names on every message -->
    <!--         <span class="direct-chat-name" class:float-right="{sentByMe}" class:float-left="{!sentByMe}">{sentByMe==true?nameMe:nameChatPartner}</span> -->
    {#if !placeholder}
      <span
        class="direct-chat-timestamp"
        class:float-left={sentByMe}
        class:float-right={!sentByMe}
      >
        {new Date(timestamp).toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </span>
    {/if}
  </div>
  <img class="direct-chat-img" src={sentByMe == true ? Dave : Hal} alt="pic" />
  <div class="direct-chat-text">
    <div class="d-flex">
      <span class="mr-auto">
        {#if placeholder}
          {"..."}
        {:else}
          {message}
        {/if}
      </span>
    </div>
  </div>
</div>

<style>
  .direct-chat-msg,
  .direct-chat-text {
    display: block;
  }
  .direct-chat-msg {
    margin-bottom: 10px;
  }
  .direct-chat-msg:before,
  .direct-chat-msg:after {
    content: " ";
    display: table;
  }
  .direct-chat-msg:after {
    clear: both;
  }
  .direct-chat-text {
    border-radius: 5px;
    position: relative;
    padding: 5px 10px;
    background: #d2d6de;
    border: 1px solid #d2d6de;
    margin: 2px 0 5px 50px;
    color: #444;
    margin-right: 50px;
  }
  .direct-chat-text:after,
  .direct-chat-text:before {
    position: absolute;
    right: 100%;
    top: 15px;
    border: solid transparent;
    border-right-color: #d2d6de;
    content: " ";
    height: 0;
    width: 0;
    pointer-events: none;
  }
  .direct-chat-text:after {
    border-width: 5px;
    margin-top: -5px;
  }
  .direct-chat-text:before {
    border-width: 6px;
    margin-top: -6px;
  }
  .right .direct-chat-text {
    margin-right: 50px;
    margin-left: 50px;
  }
  .right .direct-chat-text:after,
  .right .direct-chat-text:before {
    right: auto;
    left: 100%;
    border-right-color: transparent;
    border-left-color: #d2d6de;
  }
  img {
    border-radius: 50%;
    float: left;
    width: 40px;
    height: 40px;
  }
  .right img {
    float: right;
  }

  .direct-chat-infos {
    font-size: 0.8rem;
  }
  .direct-chat-name {
    font-weight: 600;
  }
  .direct-chat-timestamp {
    margin-left: 50px;
    margin-right: 50px;
    color: #999;

    margin-bottom: 0;
  }

  .read-icon {
    color: #007bff;
  }

  .un-read-icon {
    color: #8f8f8f8f;
  }
</style>
