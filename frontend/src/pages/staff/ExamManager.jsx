import React, { useState } from "react";
import { examsAPI } from '../../services/api';

// Simple Exam Manager UI for staff/HR
export default function ExamManager() {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [newQuestion, setNewQuestion] = useState("");

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion]);
      setNewQuestion("");
    }
  };

  const removeQuestion = idx => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const [status, setStatus] = useState("");
  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("");
    try {
      const examData = {
        title,
        description,
        durationMinutes: duration,
        questions: questions.map(q => ({ question: q, maxMarks: 10 }))
      };
      await examsAPI.create(examData);
      setStatus("Exam created successfully!");
      setTitle("");
      setDescription("");
      setDuration(60);
      setQuestions([]);
    } catch (err) {
      setStatus("Failed to create exam. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-indigo-200">
      <h2 className="text-3xl font-extrabold mb-6 text-indigo-700 text-center tracking-tight">Exam Preparation & Conduct</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {status && (
          <div className={`mb-2 font-semibold text-center ${status.includes('success') ? 'text-green-700' : 'text-red-700'}`}>{status}</div>
        )}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Exam Title</label>
          <input
            className="w-full p-3 border border-indigo-300 rounded-lg text-gray-900 bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter exam title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Exam Description</label>
          <textarea
            className="w-full p-3 border border-indigo-300 rounded-lg text-gray-900 bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter exam description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Duration (minutes)</label>
          <input
            className="w-full p-3 border border-indigo-300 rounded-lg text-gray-900 bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            type="number"
            min={10}
            max={180}
            placeholder="Duration (minutes)"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Questions</label>
          <div className="flex mb-2 gap-2">
            <input
              className="flex-1 p-3 border border-indigo-300 rounded-lg text-gray-900 bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Add a question"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
            />
            <button type="button" className="px-5 py-2 bg-blue-700 text-white rounded-lg font-bold shadow-sm hover:bg-blue-800 transition" onClick={addQuestion}>
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {questions.map((q, idx) => (
              <li key={idx} className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="flex-1 text-gray-900 font-medium">{q}</span>
                <button type="button" className="ml-2 text-red-700 font-bold hover:text-red-900" onClick={() => removeQuestion(idx)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" className="w-full py-3 bg-green-700 text-white rounded-lg font-bold text-lg shadow-md hover:bg-green-800 transition">
          Create Exam
        </button>
      </form>
    </div>
  );
}
