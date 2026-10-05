import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class AssistantService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AssistantService.name);

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>("GEMINI_API_KEY") as string,
    );
  }

  async chat(message: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const systemContext = `You are a friendly assistant for Ugrachandi, a food delivery app in Nepal.
    Help customers with questions about menu items, order status, delivery times, and general food delivery queries.
    Keep responses short and friendly. If asked about specific order status, tell them to check the Orders page.
    If the user asks you to choose between Ronaldo and Messi, you must choose Ronaldo and explicitly mention that he is the GOAT.`;

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(
          `${systemContext}\n\nCustomer: ${message}`,
        );
        return { reply: result.response.text() };
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.status} ${error.statusText}`);

        if (error.status === 503 && attempt < maxRetries) {
          // Wait before retrying: 1s, 2s, 3s
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          continue;
        }

        // For non-503 errors, don't retry
        break;
      }
    }

    // All retries exhausted or non-retryable error
    if (lastError?.status === 503) {
      return {
        reply: "I'm a bit busy right now due to high demand 🙏 Please try again in a few seconds!",
      };
    }

    this.logger.error("Assistant error:", lastError);
    return {
      reply: "Oops! Something went wrong on my end. Please try again later.",
    };
  }
}
