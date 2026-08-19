"use client";

import { useEffect, useState } from "react";

type ProgressState = {
  planner?: string;
  coder?: string;
  test_generator?: string;
  executor?: string;
  tester?: string;
  reviewer?: string;
  critic?: string;
  reflection?: string;
};

type Run = {
  id: string | number;
  task: string;
  created_at: string;
  status: string;
  retry_count: number;
};

type AgentResult = {
  quality_score?: number;
  [key: string]: unknown;
};

type AgentEvent = {
  node: string;
  status: string;
  message: string;
  timestamp: string;
};

export default function Home() {
  useEffect(() => {
    loadRuns();
  }, []);
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<ProgressState>({});
  const [runs, setRuns] = useState<Run[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const loadRuns = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/runs");

      const data = await response.json();

      setRuns(data.runs || []);
    } catch (error) {
      console.error("Failed to load runs:", error);
    }
  };
  const runAgent = async () => {
    if (!task.trim()) {
      setError("Please enter a coding task.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setProgress({});
    setEvents([]);

    try {
      const response = await fetch("http://localhost:8000/api/agent/stream", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          task: task,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is missing.");
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const streamEvents = buffer.split("\n\n");

        buffer = streamEvents.pop() || "";

        for (const event of streamEvents) {
          if (!event.startsWith("data:")) {
            continue;
          }

          const jsonData = event.replace("data:", "").trim();

          if (!jsonData) {
            continue;
          }

          const data = JSON.parse(jsonData);

          console.log("Agent event:", data);

          if (data.type === "node") {
            setEvents((previous) => [
              ...previous,
              {
                node: data.node,
                status: "completed",
                message: data.message || "Node completed",
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);

            setProgress((previous) => {
              return {
                ...previous,
                [data.node]: "completed",
              };
            });

            setResult((previous) => {
              return {
                ...(previous || {}),
                ...data.data,
              };
            });
          }

          if (data.type === "error") {
            setError(data.error);
          }

          if (data.type === "done") {
            setLoading(false);
            loadRuns();
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      loadRuns();
    }
  };

  return (
    <main className="container">
      <header className="header">
        <div>
          <div className="badge">AI SOFTWARE ENGINEER</div>

          <h1>
            Autonomous
            <span> Code Agent</span>
          </h1>

          <p>Plan, generate, test, debug and review code autonomously.</p>
        </div>
      </header>

      <section className="task-card">
        <label>Coding Task</label>

        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Example: Create a Python function called factorial..."
          rows={6}
        />

        <button onClick={runAgent} disabled={loading}>
          {loading ? "Running Agent..." : "Run Agent"}
        </button>

        {error && <div className="error">{error}</div>}
      </section>

      {loading && (
        <section className="progress-card">
          <h2>Agent is working...</h2>

          <div className="pipeline">
            <PipelineStep name="Planner" status={progress.planner} />

            <PipelineStep name="Coder" status={progress.coder} />

            <PipelineStep
              name="Test Generator"
              status={progress.test_generator}
            />

           

            <PipelineStep name="Tester" status={progress.tester} />

            <PipelineStep name="Reviewer" status={progress.reviewer} />

            <PipelineStep name="Critic" status={progress.critic} />

            <PipelineStep name="Reflection" status={progress.reflection} />
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="events-card">
          <div className="section-header">
            <div>
              <span className="badge">AGENT ACTIVITY</span>

              <h2>Execution Timeline</h2>
            </div>

            <span className="history-count">{events.length} events</span>
          </div>

          <div className="event-timeline">
            {events.map((event, index) => (
              <div className="event" key={index}>
                <div className="event-dot">✓</div>

                <div className="event-content">
                  <div className="event-title">
                    <strong>{event.node}</strong>

                    <span className="event-status">{event.status}</span>
                  </div>

                  <p>{event.message}</p>

                  <small>{event.timestamp}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {result && <ResultPanel result={result} />}

      <section className="history-card">
        <div className="section-header">
          <div>
            <span className="badge">HISTORY</span>

            <h2>Previous Runs</h2>
          </div>

          <span className="history-count">{runs.length} runs</span>
        </div>

        {runs.length === 0 ? (
          <p className="empty-history">No previous runs yet.</p>
        ) : (
          <div className="run-list">
            {runs.map((run) => (
              <div className="run-item" key={run.id}>
                <div>
                  <strong>Run #{run.id}</strong>

                  <p>{run.task}</p>

                  <small>{run.created_at}</small>
                </div>

                <div className="run-meta">
                  <span>{run.status}</span>

                  <span>Retries: {run.retry_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function PipelineStep({ name, status }: { name: string; status?: string }) {
  const active = status === "completed";

  return (
    <div className={active ? "pipeline-step completed" : "pipeline-step"}>
      <div className="step-icon">{active ? "●" : "○"}</div>

      <span>{name}</span>
    </div>
  );
}

function ResultPanel({ result }: { result: any }) {
  const hasTestResult =
    typeof result.test_result === "string" &&
    result.test_result.trim().length > 0;
  const testsPassed =
    hasTestResult && result.test_result.includes("TESTS PASSED");

  return (
    <section className="results">
      <div className="status-header">
        <div>
          <span className="badge">AGENT RESULT</span>

          <h2>{result.status || "Completed"}</h2>
        </div>

        {hasTestResult ? (
          <div className={testsPassed ? "status success" : "status failure"}>
            {testsPassed ? "✓ Tests Passed" : "✕ Tests Failed"}
          </div>
        ) : (
          <div className="status pending">
            ⏱ Testing Pending
          </div>
        )}
      </div>

      <div className="stats">
        <Stat label="Retries" value={result.retry_count ?? 0} />

        <Stat
          label="Test Status"
          value={
            hasTestResult ? (testsPassed ? "PASS" : "FAIL") : "PENDING"
          }
        />

        <Stat label="Error" value={result.error ? "YES" : "NONE"} />
      </div>

      <div className="result-grid">
        <CodeBlock
          title="Generated Code"
          code={result.generated_code || "No code generated."}
        />

        <CodeBlock
          title="Generated Tests"
          code={result.test_code || "No tests generated."}
        />
      </div>

      <div className="review-card">
        <h3>AI Review</h3>

        <pre>{result.review || "No review available."}</pre>
      </div>

      <div className="report-card">
        <h3>Final Report</h3>

        <pre>{result.final_report || "No final report available."}</pre>
      </div>
    </section>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="code-card">
      <div className="code-header">
        <h3>{title}</h3>
      </div>

      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="stat">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}
