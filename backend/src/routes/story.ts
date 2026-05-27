import { Router, type IRouter, type Request, type Response } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface StoryPlayer { name: string; cards: { label: string; value: string }[]; }
interface StoryRequestBody {
  survivors: StoryPlayer[];
  eliminated: StoryPlayer[];
  disaster?: { name?: string; description?: string } | null;
  bunker?: { description?: string } | null;
}

router.post("/story", async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as StoryRequestBody;
    if (!body || !Array.isArray(body.survivors)) { res.status(400).json({ error: "Invalid body" }); return; }
    const fmtPlayer = (p: StoryPlayer) =>
      `- ${p.name}: ${p.cards.map(c => `${c.label} – ${c.value}`).join("; ") || "(карт нээгээгүй)"}`;
    const prompt = `Чи бол монгол зохиолч. Доорх "Сонголт" тоглоомын тоглогчдын нээсэн картууд дээр үндэслэн, ${body.disaster?.name ?? "гамшиг"}-аас амьд үлдсэн тоглогчид бункерт хэрхэн орж ирсэн тухай ЗӨВХӨН НЭГ ПАРАГРАФ, 4-6 өгүүлбэртэй богино түүх бич. Хасагдсан тоглогч байвал 1 өгүүлбэрт дурд. Зөвхөн монгол кирилл үсгээр, аятайхан, бага зэрэг хошин шогтой өгүүл. Мөр шилжүүлэлгүй, нэг л урсгал параграф.\n\nГАМШИГ: ${body.disaster?.name ?? "—"} — ${body.disaster?.description ?? ""}\nБУНКЕР: ${body.bunker?.description ?? "—"}\n\nАМЬД ҮЛДСЭН ТОГЛОГЧИД:\n${body.survivors.map(fmtPlayer).join("\n")}\n\nХАСАГДСАН ТОГЛОГЧИД:\n${body.eliminated.map(fmtPlayer).join("\n") || "(байхгүй)"}\n\nЗөвхөн өгүүллэгийн текстийг буцаа, толгой гарчиг болон мөр шилжүүлэлт хэрэггүй.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", max_tokens: 500,
      messages: [
        { role: "system", content: "Чи бүтээлч монгол зохиолч. Зөвхөн монгол кирилл үсгээр бич." },
        { role: "user", content: prompt },
      ],
    });
    res.json({ story: completion.choices[0]?.message?.content?.trim() || "" });
  } catch (e: any) {
    logger.error({ err: e }, "story generation failed");
    res.status(500).json({ error: e?.message || "Өгүүллэг үүсгэж чадсангүй" });
  }
});

export default router;
