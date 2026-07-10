import { useState } from "react";
import axios from "axios";
import { SearchX, Loader2 } from "lucide-react";
import SearchBar from "./components/SearchBar";
import ResultCard from "./components/ResultCard";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (companyName) => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await axios.post("/api/analyze", { company: companyName });
      setResult(response.data);
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Make sure the backend is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/50 border-b border-white/5 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div>
            <img
              src="/logo.png"
              alt="CapitalIQ Logo"
              className="w-25 h-25 object-contain brightness-0 invert"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              CapitalIQ
            </h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
              AI Investment Agent
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Smarter{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Investments
              </span>
              , Instantly.
            </h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-light">
              Enter any company name and let our AI analyze live financials and market news to
              deliver a clear investment recommendation.
            </p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <SearchBar onAnalyze={handleAnalyze} loading={loading} />
          </div>

          {loading && (
            <div className="text-center mt-20 animate-fade-in flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
              </div>
              <p className="text-slate-400 text-sm mt-6 font-medium animate-pulse">
                Fetching live financials, reading news, and analyzing...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="mt-12 max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-5 animate-fade-in">
              <p className="text-red-400 text-sm font-medium flex items-center gap-3">
                <span className="bg-red-500/20 p-1.5 rounded-lg">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-slide-up mt-16" style={{ animationDelay: "0.2s" }}>
              <ResultCard data={result} />
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center mt-24 text-slate-600 animate-fade-in">
              <div className="bg-slate-800/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <SearchX className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm font-medium">Ready to analyze your next big opportunity.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
