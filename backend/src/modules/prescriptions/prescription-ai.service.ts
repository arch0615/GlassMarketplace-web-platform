import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class PrescriptionAiService {
  private readonly logger = new Logger(PrescriptionAiService.name);
  private client: Anthropic | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      this.logger.log('Anthropic AI configured for prescription analysis');
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not set — AI prescription analysis disabled');
    }
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<string | null> {
    if (!this.client) return null;

    try {
      const base64 = imageBuffer.toString('base64');
      const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `Analizá esta receta óptica y transcribí los datos de graduación en formato estructurado.

Devolvé SOLO el siguiente formato (sin explicaciones adicionales):

OJO DERECHO (OD):
• Esfera (ESF): ...
• Cilindro (CIL): ...
• Eje: ...°
• Adición (ADD): ...

OJO IZQUIERDO (OI):
• Esfera (ESF): ...
• Cilindro (CIL): ...
• Eje: ...°
• Adición (ADD): ...

DISTANCIA PUPILAR (DP): ...

OBSERVACIONES: ...

Si algún campo no es legible o no está presente, indicá "No especificado".
Si la imagen no es una receta óptica, indicá "No se detectó una receta óptica en la imagen."`,
              },
            ],
          },
        ],
      });

      const text = response.content[0]?.type === 'text' ? response.content[0].text : null;
      this.logger.log('Prescription AI analysis completed');
      return text;
    } catch (err) {
      this.logger.error(`AI analysis failed: ${err.message}`);
      return null;
    }
  }
}
