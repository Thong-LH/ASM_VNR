import React, { useState } from 'react';
import { startQuiz, submitQuiz, fetchScoreboard } from '../../api/quiz';
import './QuizGame.css';

const PHASE = {
  WELCOME: 'welcome',
  QUIZ: 'quiz',
  RESULT: 'result',
  SCOREBOARD: 'scoreboard',
};

export default function QuizGame({ onClose }) {
  const [phase, setPhase] = useState(PHASE.WELCOME);
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [scoreboard, setScoreboard] = useState([]);

  const resetGame = () => {
    setPhase(PHASE.WELCOME);
    setUsername('');
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setError('');
    setResult(null);
    setScoreboard([]);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên của bạn.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await startQuiz(trimmed);
      setUsername(trimmed);
      setQuestions(data.questions);
      setAnswers(
        data.questions.map((q) => ({ questionId: q.id, answerId: null }))
      );
      setCurrentIndex(0);
      setPhase(PHASE.QUIZ);
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answerId) => {
    setAnswers((prev) =>
      prev.map((a, i) =>
        i === currentIndex ? { ...a, answerId } : a
      )
    );
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter((a) => a.answerId === null);
    if (unanswered.length > 0) {
      setError(`Bạn còn ${unanswered.length} câu chưa trả lời.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await submitQuiz(username, answers);
      setResult(data);
      setPhase(PHASE.RESULT);
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleShowScoreboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchScoreboard();
      setScoreboard(data.scoreboard || []);
      setPhase(PHASE.SCOREBOARD);
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const progress = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;
  const answeredCount = answers.filter((a) => a.answerId !== null).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="quiz-overlay" onClick={onClose}>
      <div
        className={`quiz-panel ${phase === PHASE.SCOREBOARD ? 'wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="quiz-close-btn" onClick={onClose} title="Đóng">
          ✕
        </button>

        {phase === PHASE.WELCOME && (
          <>
            <div className="quiz-header">
              <span className="quiz-badge">Trò chơi tương tác</span>
              <h2 className="quiz-title">Trắc Nghiệm Lịch Sử Đổi Mới</h2>
              <p className="quiz-subtitle">
                Kiểm tra kiến thức về giai đoạn 1986–1996. Trả lời đúng liên tiếp
                và nộp bài nhanh để ghi điểm cao trên bảng xếp hạng!
              </p>
            </div>

            {error && <div className="quiz-error">{error}</div>}

            <form onSubmit={handleStart}>
              <div className="quiz-form-group">
                <label className="quiz-label" htmlFor="quiz-username">
                  Tên người chơi
                </label>
                <input
                  id="quiz-username"
                  className="quiz-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  maxLength={50}
                  autoFocus
                  disabled={loading}
                />
              </div>
              <button className="quiz-btn" type="submit" disabled={loading}>
                {loading ? 'Đang tải câu hỏi...' : 'Bắt đầu chơi'}
              </button>
            </form>

            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="quiz-btn secondary"
                type="button"
                onClick={handleShowScoreboard}
                disabled={loading}
              >
                Xem bảng xếp hạng
              </button>
            </div>
          </>
        )}

        {phase === PHASE.QUIZ && currentQuestion && (
          <>
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="quiz-progress-text">
              Câu {currentIndex + 1} / {questions.length}
              {' · '}
              Đã trả lời {answeredCount}/{questions.length}
            </p>

            {error && <div className="quiz-error">{error}</div>}

            <p className="quiz-question-text">{currentQuestion.text}</p>

            <div className="quiz-answers">
              {currentQuestion.answers.map((ans) => (
                <button
                  key={ans.id}
                  type="button"
                  className={`quiz-answer-btn ${
                    currentAnswer?.answerId === ans.id ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectAnswer(ans.id)}
                >
                  {ans.text}
                </button>
              ))}
            </div>

            <div className="quiz-nav-row">
              <button
                className="quiz-btn secondary"
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  setError('');
                  setCurrentIndex((i) => i - 1);
                }}
              >
                ◀ Câu trước
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  className="quiz-btn"
                  type="button"
                  disabled={!currentAnswer?.answerId}
                  onClick={() => {
                    setError('');
                    setCurrentIndex((i) => i + 1);
                  }}
                >
                  Câu tiếp ▶
                </button>
              ) : (
                <button
                  className="quiz-btn"
                  type="button"
                  disabled={!allAnswered || loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Đang nộp bài...' : 'Nộp bài'}
                </button>
              )}
            </div>

            {currentIndex < questions.length - 1 && allAnswered && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  className="quiz-btn outline"
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Đang nộp bài...' : 'Nộp bài ngay'}
                </button>
              </div>
            )}
          </>
        )}

        {phase === PHASE.RESULT && result && (
          <>
            <div className="quiz-header">
              <span className="quiz-badge">Hoàn thành</span>
              <h2 className="quiz-title">Kết quả của {username}</h2>
            </div>

            <div className="quiz-result-score">
              <div className="quiz-score-number">{result.session.score}</div>
              <p className="quiz-score-label">Điểm tổng</p>
            </div>

            <div className="quiz-breakdown">
              <div className="quiz-stat-card">
                <div className="quiz-stat-value">
                  {result.breakdown.correctCount}
                </div>
                <div className="quiz-stat-label">Câu trả lời đúng</div>
              </div>
              <div className="quiz-stat-card">
                <div className="quiz-stat-value">
                  {result.breakdown.maxStreak}
                </div>
                <div className="quiz-stat-label">Chuỗi đúng liên tiếp</div>
              </div>
              <div className="quiz-stat-card">
                <div className="quiz-stat-value">
                  +{result.breakdown.timeBonus}
                </div>
                <div className="quiz-stat-label">Thưởng thời gian</div>
              </div>
              <div className="quiz-stat-card">
                <div className="quiz-stat-value">
                  {result.breakdown.elapsedSeconds}s
                </div>
                <div className="quiz-stat-label">Thời gian làm bài</div>
              </div>
            </div>

            <div className="quiz-actions-row">
              <button
                className="quiz-btn"
                type="button"
                onClick={handleShowScoreboard}
                disabled={loading}
              >
                Xem bảng xếp hạng
              </button>
              <button
                className="quiz-btn secondary"
                type="button"
                onClick={resetGame}
              >
                Chơi lại
              </button>
            </div>
          </>
        )}

        {phase === PHASE.SCOREBOARD && (
          <>
            <div className="quiz-header">
              <span className="quiz-badge">Top 10</span>
              <h2 className="quiz-title">Bảng Xếp Hạng</h2>
              <p className="quiz-subtitle">
                Những người chơi có điểm cao nhất
              </p>
            </div>

            {loading ? (
              <div className="quiz-loading">
                <div className="quiz-spinner" />
                <p>Đang tải bảng xếp hạng...</p>
              </div>
            ) : scoreboard.length === 0 ? (
              <p className="quiz-empty">
                Chưa có ai hoàn thành bài quiz. Hãy là người đầu tiên!
              </p>
            ) : (
              <ul className="quiz-scoreboard-list">
                {scoreboard.map((entry, idx) => (
                  <li
                    key={entry.id}
                    className={`quiz-scoreboard-item ${
                      entry.username === username ? 'highlight' : ''
                    }`}
                  >
                    <span className="quiz-rank">{idx + 1}</span>
                    <span className="quiz-scoreboard-name">
                      {entry.username}
                    </span>
                    <span className="quiz-scoreboard-score">
                      {entry.score} đ
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {error && <div className="quiz-error">{error}</div>}

            <div className="quiz-actions-row">
              <button
                className="quiz-btn"
                type="button"
                onClick={resetGame}
              >
                Chơi mới
              </button>
              {result && (
                <button
                  className="quiz-btn secondary"
                  type="button"
                  onClick={() => setPhase(PHASE.RESULT)}
                >
                  Quay lại kết quả
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function translateError(message) {
  const map = {
    'username is required': 'Vui lòng nhập tên người chơi.',
    'username already exist': 'Tên này đã được sử dụng. Hãy chọn tên khác.',
    'answers must be a non-empty array': 'Danh sách câu trả lời không hợp lệ.',
    'quiz already submitted': 'Bài quiz này đã được nộp rồi.',
    'session not found': 'Không tìm thấy phiên chơi. Hãy bắt đầu lại.',
  };
  return map[message] || message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
