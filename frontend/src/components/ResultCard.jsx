import {
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  TrendingUp,
  Newspaper,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useState } from "react";

export default function ResultCard({ data }) {
  const isInvest = data.recommendation === "Invest";
  const [logoError, setLogoError] = useState(false);

  const scoreColor =
    data.score >= 7
      ? "text-emerald-400"
      : data.score >= 4
      ? "text-amber-400"
      : "text-rose-400";

  let logoDomain = "";
  if (data.website) {
    try {
      logoDomain = new URL(data.website).hostname.replace("www.", "");
    } catch (e) {}
  }
  if (!logoDomain) {
    const cleanName = data.company
      .replace(/[^a-zA-Z\s]/g, "")
      .trim()
      .split(" ")[0]
      .toLowerCase();
    logoDomain = `${cleanName}.com`;
  }
  const logoUrl = `https://logo.clearbit.com/${logoDomain}`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden relative">
          <div
            className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000 ${
              isInvest ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                {!logoError ? (
                  <img
                    src={logoUrl}
                    alt={`${data.company} logo`}
                    className="w-full h-full object-contain rounded-xl"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold tracking-wide border border-white/5">
                    {data.ticker}
                  </span>
                  <span className="text-slate-500 text-sm">•</span>
                  <span className="text-slate-400 text-sm font-medium">AI Analysis</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  {data.company}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 bg-slate-950/50 rounded-2xl p-4 sm:p-6 border border-white/5 shadow-inner">
              <div className="text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  Score
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-4xl font-bold ${scoreColor}`}>{data.score}</span>
                  <span className="text-slate-500 font-medium">/10</span>
                </div>
              </div>

              <div className="w-[1px] h-12 bg-white/10" />

              <div className="text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">
                  Verdict
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold shadow-lg ${
                    isInvest
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-rose-500/10"
                  }`}
                >
                  {isInvest ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {isInvest ? "INVEST" : "PASS"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-8 relative z-10">
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
              <span className="text-xl text-slate-500 mr-2">"</span>
              {data.summary}
              <span className="text-xl text-slate-500 ml-2">"</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 hover:bg-slate-900/80 transition-colors">
          <h3 className="text-emerald-400 font-semibold mb-5 flex items-center gap-2 text-lg">
            <ThumbsUp className="w-5 h-5" /> Upside
          </h3>
          <ul className="space-y-4">
            {data.pros.map((pro, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 hover:bg-slate-900/80 transition-colors">
          <h3 className="text-rose-400 font-semibold mb-5 flex items-center gap-2 text-lg">
            <ThumbsDown className="w-5 h-5" /> Downside
          </h3>
          <ul className="space-y-4">
            {data.cons.map((con, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-1.5 shrink-0" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 hover:bg-slate-900/80 transition-colors">
          <h3 className="text-amber-400 font-semibold mb-5 flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5" /> Key Risks
          </h3>
          <ul className="space-y-4">
            {data.risks.map((risk, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-lg">Live Financials</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(data.financials).map(([key, value]) => (
              <div
                key={key}
                className="bg-slate-800/80 rounded-2xl px-4 py-4 border border-white/10 hover:border-white/20 transition-colors group shadow-md"
              >
                <p className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold mb-1 break-words whitespace-normal leading-tight">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-white font-semibold text-sm">{value ?? "N/A"}</p>
              </div>
            ))}
          </div>
        </div>

        {data.news && data.news.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Newspaper className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">Market Sentiment</h3>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[340px]">
              {data.news.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-slate-950/50 hover:bg-slate-800/80 rounded-2xl px-5 py-4 border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-slate-300 text-sm font-medium leading-snug group-hover:text-white transition-colors pr-6">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-semibold tracking-wider uppercase">
                      {article.source}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">
                      {new Date(article.publishedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
