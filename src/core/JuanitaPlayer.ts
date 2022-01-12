import { Player } from "@discordx/music";
import { Guild, TextBasedChannels } from "discord.js";
import JuanitaQueue  from "./JuanitaQueue";

export default class JuanitaPlayer extends Player {
    constructor() {
      super();
  
      this.on<JuanitaQueue, "onStart">("onStart", ([queue]) => {
        queue.updateControlMessage({ force: true });
      });
  
      this.on<JuanitaQueue, "onFinishPlayback">("onFinishPlayback", ([queue]) => {
        queue.leave();
      });
  
      this.on<JuanitaQueue, "onPause">("onPause", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onResume">("onResume", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onError">("onError", ([queue, err]) => {
        queue.updateControlMessage({
          force: true,
          text: `Error: ${err.message}`,
        });
      });
  
      this.on<JuanitaQueue, "onFinish">("onFinish", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onLoop">("onLoop", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onRepeat">("onRepeat", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onSkip">("onSkip", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onTrackAdd">("onTrackAdd", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onLoopEnabled">("onLoopEnabled", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onLoopDisabled">("onLoopDisabled", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onRepeatEnabled">("onRepeatEnabled", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onRepeatDisabled">("onRepeatDisabled", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onMix">("onMix", ([queue]) => {
        queue.updateControlMessage();
      });
  
      this.on<JuanitaQueue, "onVolumeUpdate">("onVolumeUpdate", ([queue]) => {
        queue.updateControlMessage();
      });
    }
  
    getQueue(guild: Guild, channel?: TextBasedChannels): JuanitaQueue {
      return super.queue<JuanitaQueue>(guild, () => new JuanitaQueue(this, guild, channel));
    }
  }