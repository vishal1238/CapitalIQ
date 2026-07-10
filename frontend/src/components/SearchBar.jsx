import { Search, Sparkles } from "lucide-react";

export default function SearchBar({ onAnalyze, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const company = e.target.company.value.trim();
    if (company) {
      onAnalyze(company);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-500" />

      <div className="relative flex flex-col sm:flex-row gap-3 bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            name="company"
            placeholder="Enter company name (e.g. Apple, Tesla, Reliance...)"
            className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white placeholder-slate-400 focus:outline-none text-base"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-white text-slate-950 hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
        >
          <Sparkles className="w-4 h-4" />
          Analyze
        </button>
      </div>
    </form>
  );
}
