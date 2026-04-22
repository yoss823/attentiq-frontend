import {
  ANALYZE_PROGRESS_STEPS,
  formatElapsedLabel,
  getAnalyzeProgressPercent,
  getCurrentAnalyzeStepIndex,
} from "@/lib/analyze-progress";

type AnalysisLoadingStateProps = {
  elapsedMs: number;
  headline: string;
  detail: string;
};

export default function AnalysisLoadingState({
  elapsedMs,
  headline,
  detail,
}: AnalysisLoadingStateProps) {
  const currentStepIndex = getCurrentAnalyzeStepIndex(elapsedMs);
  const progressPercent = getAnalyzeProgressPercent(elapsedMs);

  return (
    <section
      style={{
        borderRadius: "28px",
        border: "1px solid rgba(0, 212, 255, 0.2)",
        background:
          "linear-gradient(180deg, rgba(11, 16, 22, 0.98) 0%, rgba(7, 11, 16, 0.96) 100%)",
        boxShadow: "0 28px 90px rgba(0, 0, 0, 0.32)",
        padding: "22px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 800,
              color: "var(--accent)",
            }}
          >
            Analyse en cours
          </p>
          <h2
            style={{
              margin: "10px 0 0",
              fontSize: "clamp(1.4rem, 5vw, 2rem)",
              lineHeight: 1,
              letterSpacing: "-0.06em",
              color: "var(--text-primary)",
            }}
          >
            {headline}
          </h2>
        </div>

        <div
          style={{
            padding: "10px 12px",
            borderRadius: "18px",
            border: "1px solid rgba(0, 212, 255, 0.18)",
            background: "rgba(0, 212, 255, 0.08)",
            color: "var(--accent)",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          {formatElapsedLabel(elapsedMs)}
        </div>
      </div>

      <p
        style={{
          margin: "14px 0 0",
          fontSize: "14px",
          lineHeight: 1.75,
          color: "var(--text-secondary)",
        }}
      >
        {detail}
      </p>

      <div
        style={{
          marginTop: "18px",
          height: "10px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(90deg, var(--accent), #79e7ff)",
            boxShadow: "0 0 24px rgba(0, 212, 255, 0.24)",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gap: "10px",
        }}
      >
        {ANALYZE_PROGRESS_STEPS.map((step, index) => {
          const state =
            index < currentStepIndex
              ? "done"
              : index === currentStepIndex
                ? "current"
                : "upcoming";

          return (
            <div
              key={step.label}
              style={{
                display: "grid",
                gridTemplateColumns: "22px minmax(0, 1fr)",
                gap: "12px",
                alignItems: "start",
                padding: "12px 14px",
                borderRadius: "18px",
                border:
                  state === "current"
                    ? "1px solid rgba(0, 212, 255, 0.24)"
                    : "1px solid var(--border)",
                background:
                  state === "current"
                    ? "rgba(0, 212, 255, 0.08)"
                    : "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 900,
                  border:
                    state === "done"
                      ? "1px solid rgba(52, 211, 153, 0.28)"
                      : state === "current"
                        ? "1px solid rgba(0, 212, 255, 0.26)"
                        : "1px solid rgba(255,255,255,0.08)",
                  background:
                    state === "done"
                      ? "rgba(52, 211, 153, 0.12)"
                      : state === "current"
                        ? "rgba(0, 212, 255, 0.12)"
                        : "rgba(255,255,255,0.03)",
                  color:
                    state === "done"
                      ? "#86efac"
                      : state === "current"
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                }}
              >
                {state === "done" ? "✓" : index + 1}
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: 800,
                    color:
                      state === "upcoming"
                        ? "rgba(237, 242, 247, 0.72)"
                        : "var(--text-primary)",
                  }}
                >
                  {step.label}
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "13px",
                    lineHeight: 1.65,
                    color: "var(--text-secondary)",
                  }}
                >
                  {step.helper}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
