<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import Sidebar from "../Sidebar.svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import store from "./store.js";
  import Thoughts from "./Thoughts.svelte";

  let nameMe = "Me";
  let profilePicMe =
    "https://p0.pikist.com/photos/474/706/boy-portrait-outdoors-facial-men-s-young-t-shirt-hair-person-thumbnail.jpg";

  let nameChatPartner = "John Doe";
  let profilePicChatPartner = "/hal.";

  let messages = [];
  let message = "";
  let listElement;

  $: displayedThoughts = null;

  $: waiting = false;

  onMount(() => {
    store.subscribe((currentMessage) => {
      if (currentMessage !== "") {
        waiting = false;
        messages = [...messages, currentMessage];
      }
    });
  });

  const scrollToBottom = async (node) => {
    node.scroll({ top: node.scrollHeight, behavior: "smooth" });
  };

  afterUpdate(() => {
    console.log("afterUpdate");
    if (messages) scrollToBottom(listElement);
  });

  function onSendMessage() {
    if (message.length > 0) {
      let newMessage = { text: message, isUser: true, timestamp: Date.now() };
      waiting = true;
      store.sendMessage(newMessage);
      messages = [...messages, newMessage];
      message = "";
    }
  }

  function closeThoughts(e) {
    displayedThoughts = null;
  }

  function showThoughts(e) {
    displayedThoughts = e.detail.thoughts;
    console.log("Show thoughts");
    console.log(e.detail.thoughts);
  }

  $: console.log("message ", message);
  $: console.log("messages ", messages);
</script>

<Sidebar>
  <div id="chat-window">
    <h2>Talk to the Demoland...</h2>
    {#if !displayedThoughts}
      <div class="messages" bind:this={listElement}>
        {#each messages as message, i}
          <ChatMessage
            message={message.text}
            {nameChatPartner}
            {nameMe}
            {profilePicMe}
            {profilePicChatPartner}
            timestamp={message.timestamp}
            sentByMe={message.isUser}
            steps={message.steps}
            on:showThoughts={showThoughts}
          />
        {/each}
        {#if waiting}
          <ChatMessage
            message={""}
            timestamp={""}
            placeholder={true}
            {profilePicMe}
            {nameMe}
            {nameChatPartner}
            {profilePicChatPartner}
            sentByMe={false}
          />
        {/if}
      </div>
      <div class="card-footer">
        <div class="input-group">
          <input
            type="text"
            placeholder="Ask a question ..."
            class="form-control"
            bind:value={message}
            disabled={waiting}
          />
          <span class="input-group-append">
            <button
              type="button"
              on:click={onSendMessage}
              disabled={waiting}
              class="btn btn-primary"
            >
              Send
            </button>
          </span>
        </div>
      </div>
    {:else}
      <Thoughts thoughts={displayedThoughts} on:close={closeThoughts} />
    {/if}
  </div>
</Sidebar>

<style>
  h2 {
    margin-top: 0px;
  }
  div#chat-window {
    min-width: 350px;
  }
  .messages {
    max-height: 300px;
    overflow-y: auto;
  }
  div.input-group {
    display: flex;
  }
  input.form-control {
    padding: 0.375rem 0.75rem;
    box-sizing: border-box;
    flex: 1;
  }
  button {
    cursor: pointer;
    font-weight: 400;
    text-align: center;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    color: white;
    background-color: rgb(0, 123, 255);
  }
</style>
