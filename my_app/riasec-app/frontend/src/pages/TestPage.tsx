import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
} from "lucide-react";
import { assessmentApi } from "../api/client";
import { Modal } from "../components/common/Modal";
import { Question, RiasecKey, TestResult } from "../types";

interface TestPageProps {
  onBack: () => void;
  onFinishTest: (result: TestResult) => void;
}

// Bộ 42 câu hỏi chuẩn RIASEC (7 câu/nhóm) dự phòng chất lượng cao
// const DEFAULT_QUESTIONS: Question[] = [
//   // Realistic (R)
//   {
//     id: "r1",
//     content: "Tôi thích lắp ráp, sửa chữa các thiết bị điện tử hoặc máy móc.",
//     type: "R",
//   },
//   {
//     id: "r2",
//     content:
//       "Tôi thích các công việc thực hành ngoài trời hơn là ngồi bàn giấy cả ngày.",
//     type: "R",
//   },
//   {
//     id: "r3",
//     content: "Tôi thích tự tay làm đồ mộc, thủ công hoặc cơ khí chế tạo.",
//     type: "R",
//   },
//   {
//     id: "r4",
//     content:
//       "Tôi có khả năng sử dụng tốt các dụng cụ kỹ thuật và máy bay không người lái.",
//     type: "R",
//   },
//   {
//     id: "r5",
//     content:
//       "Tôi thích tìm hiểu cấu tạo phần cứng của máy tính và thiết bị viễn thông.",
//     type: "R",
//   },
//   {
//     id: "r6",
//     content:
//       "Tôi thích tham gia hoạt động dã ngoại, trồng trọt hoặc chăm sóc vật nuôi.",
//     type: "R",
//   },
//   {
//     id: "r7",
//     content:
//       "Tôi giải quyết vấn đề tốt nhất khi có công cụ hoặc vật mẫu cụ thể trước mắt.",
//     type: "R",
//   },

//   // Investigative (I)
//   {
//     id: "i1",
//     content:
//       "Tôi thích đọc các tài liệu khoa học, khám phá quy luật tự nhiên và vũ trụ.",
//     type: "I",
//   },
//   {
//     id: "i2",
//     content:
//       "Tôi thích phân tích dữ liệu, tìm ra nguyên nhân cốt lõi của các bài toán khó.",
//     type: "I",
//   },
//   {
//     id: "i3",
//     content:
//       "Tôi thích lập trình, xây dựng thuật toán và mô hình trí tuệ nhân tạo (AI).",
//     type: "I",
//   },
//   {
//     id: "i4",
//     content:
//       "Tôi tò mò muốn biết cách vạn vật vận hành từ cấp độ vi mô đến vĩ mô.",
//     type: "I",
//   },
//   {
//     id: "i5",
//     content:
//       "Tôi thích làm việc độc lập trong phòng thí nghiệm hoặc môi trường nghiên cứu.",
//     type: "I",
//   },
//   {
//     id: "i6",
//     content:
//       'Tôi luôn đặt câu hỏi "Tại sao?" trước các hiện tượng trong đời sống.',
//     type: "I",
//   },
//   {
//     id: "i7",
//     content:
//       "Tôi thích đánh giá các lập luận dựa trên bằng chứng khoa học xác thực.",
//     type: "I",
//   },

//   // Artistic (A)
//   {
//     id: "a1",
//     content:
//       "Tôi thích vẽ, thiết kế đồ họa, chụp ảnh hoặc quay dựng video nghệ thuật.",
//     type: "A",
//   },
//   {
//     id: "a2",
//     content:
//       "Tôi thích viết truyện, làm thơ hoặc sáng tạo nội dung truyền thông độc đáo.",
//     type: "A",
//   },
//   {
//     id: "a3",
//     content:
//       "Tôi thích nghe nhạc, chơi nhạc cụ hoặc tham gia các hoạt động kịch nghệ.",
//     type: "A",
//   },
//   {
//     id: "a4",
//     content:
//       "Tôi thích làm việc trong môi trường tự do, không bị gò bó bởi quy tắc cứng nhắc.",
//     type: "A",
//   },
//   {
//     id: "a5",
//     content:
//       "Tôi nhạy cảm với màu sắc, âm thanh, thẩm mỹ và bố cục không gian.",
//     type: "A",
//   },
//   {
//     id: "a6",
//     content: "Tôi thường nảy ra những ý tưởng khác biệt mà ít người nghĩ tới.",
//     type: "A",
//   },
//   {
//     id: "a7",
//     content:
//       "Tôi thích thể hiện cảm xúc và cá tính riêng qua các tác phẩm sáng tạo.",
//     type: "A",
//   },

//   // Social (S)
//   {
//     id: "s1",
//     content:
//       "Tôi thích lắng nghe, an ủi và chia sẻ khó khăn với bạn bè, người thân.",
//     type: "S",
//   },
//   {
//     id: "s2",
//     content:
//       "Tôi có hứng thú với công việc giảng dạy, đào tạo và hướng dẫn người khác.",
//     type: "S",
//   },
//   {
//     id: "s3",
//     content:
//       "Tôi thích tham gia các hoạt động tình nguyện, thiện nguyện giúp đỡ cộng đồng.",
//     type: "S",
//   },
//   {
//     id: "s4",
//     content:
//       "Tôi dễ dàng hòa nhập và làm quen với những người bạn mới trong tập thể.",
//     type: "S",
//   },
//   {
//     id: "s5",
//     content:
//       "Tôi quan tâm đến sức khỏe tinh thần, tâm lý và cảm xúc của mọi người xung quanh.",
//     type: "S",
//   },
//   {
//     id: "s6",
//     content: "Tôi thích làm việc nhóm hơn là phải làm việc một mình suốt ngày.",
//     type: "S",
//   },
//   {
//     id: "s7",
//     content: "Tôi hòa giải tốt các mâu thuẫn giữa các thành viên trong nhóm.",
//     type: "S",
//   },

//   // Enterprising (E)
//   {
//     id: "e1",
//     content:
//       "Tôi thích đóng vai trò trưởng nhóm, điều phối công việc và truyền cảm hứng.",
//     type: "E",
//   },
//   {
//     id: "e2",
//     content:
//       "Tôi có hứng thú với kinh doanh, khởi nghiệp và tìm kiếm cơ hội thị trường.",
//     type: "E",
//   },
//   {
//     id: "e3",
//     content:
//       "Tôi tự tin thuyết trình trước đám đông và thuyết phục người khác đồng thuận.",
//     type: "E",
//   },
//   {
//     id: "e4",
//     content:
//       "Tôi thích đặt ra những mục tiêu tham vọng và tìm cách chinh phục chúng.",
//     type: "E",
//   },
//   {
//     id: "e5",
//     content:
//       "Tôi thích đàm phán, thương lượng để đạt được thỏa thuận có lợi nhất.",
//     type: "E",
//   },
//   {
//     id: "e6",
//     content:
//       "Tôi không ngại đương đầu với rủi ro nếu có tiềm năng phát triển lớn.",
//     type: "E",
//   },
//   {
//     id: "e7",
//     content:
//       "Tôi thích xây dựng mạng lưới quan hệ và kết nối những người tài năng.",
//     type: "E",
//   },

//   // Conventional (C)
//   {
//     id: "c1",
//     content:
//       "Tôi thích làm việc với các bảng tính Excel, con số và báo cáo tài chính.",
//     type: "C",
//   },
//   {
//     id: "c2",
//     content:
//       "Tôi thích sắp xếp tài liệu, công việc theo trình tự rõ ràng, ngăn nắp.",
//     type: "C",
//   },
//   {
//     id: "c3",
//     content:
//       "Tôi luôn kiểm tra cẩn thận từng chi tiết để tránh xảy ra sai sót nhỏ.",
//     type: "C",
//   },
//   {
//     id: "c4",
//     content:
//       "Tôi cảm thấy an tâm khi làm việc theo kế hoạch và quy trình tiêu chuẩn.",
//     type: "C",
//   },
//   {
//     id: "c5",
//     content:
//       "Tôi quản lý thời gian và ngân sách cá nhân rất kỷ luật và hiệu quả.",
//     type: "C",
//   },
//   {
//     id: "c6",
//     content:
//       "Tôi thích lưu trữ hồ sơ, cơ sở dữ liệu và quản lý thông tin hệ thống.",
//     type: "C",
//   },
//   {
//     id: "c7",
//     content: "Tôi là người luôn đúng giờ và nghiêm túc chấp hành các quy định.",
//     type: "C",
//   },
// ];

const LIKERT_OPTIONS = [
  {
    value: 1,
    label: "Strongly Disagree",
    shortLabel: "Strongly Disagree",
    color: "#EF4444",
  },
  {
    value: 2,
    label: "Disagree",
    shortLabel: "Disagree",
    color: "#F97316",
  },
  {
    value: 3,
    label: "Neutral / Unsure",
    shortLabel: "Neutral",
    color: "#EAB308",
  },
  { value: 4, label: "Agree", shortLabel: "Agree", color: "#10B981" },
  {
    value: 5,
    label: "Strongly Agree",
    shortLabel: "Strongly Agree",
    color: "#059669",
  },
];

export const TestPage: React.FC<TestPageProps> = ({ onBack, onFinishTest }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await assessmentApi.getQuestions();

        if (data && data.length >= 10) {
          setQuestions(data);
        }
      } catch (err) {
        // setQuestions(DEFAULT_QUESTIONS);
      }
    };
    loadQuestions();
  }, []);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(
    ((currentIndex + 1) / totalQuestions) * 100,
  );
  const currentAnswer = answers[currentIndex];
  if (questions.length === 0 || !currentQuestion) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: 12,
          color: "var(--text-secondary)",
        }}
      >
        <div>Loading questions...</div>
      </div>
    );
  }
  const handleSelectOption = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formattedAnswers = questions.map((q, idx) => ({
      questionId: q.id,
      score: answers[idx] || 3,
    }));

    const scores: Record<RiasecKey, number> = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    };
    questions.forEach((q, idx) => {
      const val = answers[idx] || 3;
      const trait = q.type?.toUpperCase() as RiasecKey;
      if (scores[trait] !== undefined) scores[trait] += val;
    });
    const sortedTraits = (Object.keys(scores) as RiasecKey[]).sort(
      (a, b) => scores[b] - scores[a],
    );
    const top3Code = sortedTraits.slice(0, 3).join("");

    try {
      const backendResult = await assessmentApi
        .submitTest({ answers: formattedAnswers })
        .catch(() => null);

      if (backendResult) {
        onFinishTest(backendResult);
      } else {
        onFinishTest({
          resultCode: top3Code,
          scores,
          primaryType: sortedTraits[0],
          testedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error submitting assessment:", err);
      onFinishTest({
        resultCode: top3Code,
        scores,
        primaryType: sortedTraits[0],
        testedAt: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Top Bar with Exit button & Quiz progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          className="btn-icon"
          onClick={() => setShowExitModal(true)}
          title="Exit assessment"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
            }}
          >
            Question {currentIndex + 1} / {totalQuestions}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Completed {Object.keys(answers).length}/{totalQuestions} questions
          </div>
        </div>

        <div style={{ width: 36 }} />
      </div>

      {/* Progress Bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Instruction */}
      <div
        style={{
          background: "var(--bg-subtle)",
          padding: "10px 14px",
          borderRadius: 12,
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid var(--border-color)",
        }}
      >
        <HelpCircle
          size={16}
          color="var(--primary-teal)"
          style={{ flexShrink: 0 }}
        />
        <span>
          Read each statement and select how well it describes your preference:
        </span>
      </div>

      {/* Question Card */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: "28px 22px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border-color)",
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
            lineHeight: 1.5,
          }}
        >
          {currentQuestion.content}
        </p>
      </div>

      {/* Likert Scale Options (1 to 5) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LIKERT_OPTIONS.map((opt) => {
          const isSelected = currentAnswer === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => handleSelectOption(opt.value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: 14,
                background: isSelected ? "rgba(1, 173, 192, 0.08)" : "white",
                border: `2px solid ${isSelected ? "var(--primary-teal)" : "var(--border-color)"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? "var(--primary-teal)" : "var(--border-color)"}`,
                    background: isSelected
                      ? "var(--primary-teal)"
                      : "transparent",
                    color: isSelected ? "white" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                  }}
                >
                  {opt.value}
                </div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: isSelected ? 700 : 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {opt.label}
                </span>
              </div>

              {isSelected && (
                <CheckCircle2 size={18} color="var(--primary-teal)" />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        <button
          className="btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ flex: 1, opacity: currentIndex === 0 ? 0.5 : 1 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ flex: 2 }}
          >
            <span>{isSubmitting ? "Analyzing..." : "View Results"}</span>
            <CheckCircle2 size={18} />
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleNext}
            style={{ flex: 2 }}
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Quick Question Jump Navigator */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: "center",
          paddingTop: 10,
        }}
      >
        {questions.map((_, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                fontSize: "0.7rem",
                fontWeight: 700,
                background: isCurrent
                  ? "var(--primary-teal)"
                  : isAnswered
                    ? "#CCFBF1"
                    : "white",
                color: isCurrent
                  ? "white"
                  : isAnswered
                    ? "#0F766E"
                    : "var(--text-muted)",
                border: `1px solid ${isCurrent ? "var(--primary-teal)" : "var(--border-color)"}`,
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Exit Quiz Confirmation Dialog */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Quit Assessment?"
      >
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          Your current progress will be lost if you leave now. Are you sure you want to exit?
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary"
            style={{ flex: 1 }}
            onClick={() => setShowExitModal(false)}
          >
            Continue Test
          </button>
          <button
            className="btn-primary"
            style={{ flex: 1, background: "#EF4444" }}
            onClick={onBack}
          >
            Confirm Exit
          </button>
        </div>
      </Modal>
    </div>
  );
};
