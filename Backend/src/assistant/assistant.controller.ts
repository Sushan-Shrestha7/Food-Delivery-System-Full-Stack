import { Body, Controller, Post } from "@nestjs/common";
import { AssistantService } from "./assistant.service";
import { ChatMessageDto } from "./dto/chat-message.dto";

@Controller("api/assistant")
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post("chat")
  async chat(@Body() dto: ChatMessageDto) {
    return this.assistantService.chat(dto.message);
  }
}
