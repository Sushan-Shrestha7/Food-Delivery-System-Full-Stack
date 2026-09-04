import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class AssistantService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>("GEMINI_API_KEY") as string,
    );
  }

  async chat(message: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const systemContext = `You are a friendly assistant for Ugrachandi, a food delivery app in Nepal.
    Help customers with questions about menu items, order status, delivery times, and general food delivery queries.
    Keep responses short and friendly. If asked about specific order status, tell them to check the Orders page.`;

    const result = await model.generateContent(
      `${systemContext}\n\nCustomer: ${message}`,
    );
    const response = result.response;
    return { reply: response.text() };
  }}
