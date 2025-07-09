"use client";

import { useState } from "react";

const wordleAPI = "https://slack-wordle-api.vercel.app/api";

type WordleInfo = {
    solution: string;
    date: string;
    day: number;
};

export default function Home() {
    const [word, setWord] = useState("");
    const [checkResult, setCheckResult] = useState<null | {
        guess: string;
        correct: boolean;
        result: number[];
    }>(null);
    const [isValid, setIsValid] = useState<null | boolean>(null);
    const [wordleData, setWordleData] = useState<null | WordleInfo>(null);
    const [showWordInfo, setShowWordInfo] = useState(false);

    const validateWord = async () => {
        const res = await fetch(`${wordleAPI}/game/valid?word=${word}`);
        const data = await res.json();
        setIsValid(data.valid);
        return data.valid;
    };

    const checkWord = async () => {
        const valid = await validateWord();
        if (valid) {
            const res = await fetch(`${wordleAPI}/game/check?word=${word}`);
            const data = await res.json();
            setCheckResult(data);
        } else {
            setCheckResult(null);
        }
    };

    return (
        <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">
                Slack Wordle API Demo
            </h1>

            <section className="mb-6">

                {showWordInfo && wordleData && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                        <p>
                            <strong>Date:</strong> {wordleData.date}
                        </p>
                        <p>
                            <strong>Solution:</strong> {wordleData.solution}
                        </p>
                        <p>
                            <strong>Day #:</strong> {wordleData.day}
                        </p>
                    </div>
                )}
            </section>

            <section className="mb-6">
                <label className="block mb-2 font-semibold">
                    Enter a 5-letter Word:
                </label>
                <input value={word} onChange={(e) => setWord(e.target.value)}
                    className="border rounded px-3 py-2 w-full" placeholder="e.g. slate (my personal Wordle starter)"
                />
                <div className="flex gap-4 mt-4">
                    <button onClick={validateWord} className="text-black border-2 px-4 py-2 rounded"
                    >
                        Validate Word
                    </button>
                    <button onClick={checkWord} className="text-black border-2 px-4 py-2 rounded"
                    >
                        Check Against Word of Day
                    </button>
                </div>

                {isValid !== null && (
                    <p className="mt-2">
                        Word is Valid: <strong> {isValid ? "Yes" : "No"}</strong>
                    </p>
                )}

                {checkResult && checkResult.result && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                        <p>
                            <strong>Guess:</strong> {checkResult.guess}
                        </p>
                        <p>
                            <strong>Correct:</strong> {checkResult.correct ? "Yes" : "No"}
                        </p>
                        <p>
                            <strong>Result:</strong> {checkResult.result.join(", ")}
                        </p>
                        <p className="text-sm text-gray-500">
                            0 = correct position, 1 = exists elsewhere, 2 = not in word
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
