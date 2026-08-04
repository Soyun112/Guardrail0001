import { StepScaffold } from "../components/StepScaffold";

export default function VerdictPage() {
  return (
    <StepScaffold
      step={3}
      title="판정"
      summary="각 업무를 🟢 AI 주도 / 🟡 협업 / 🔴 사람 주도로 판정합니다."
      comingIn="Phase 2"
      prev="/decompose"
      next="/guide"
      nextLabel="다음: 가이드"
    >
      <p>신호등 카드 + 판정 3축 근거 + 원인유형 + 추천 승인 AI</p>
      <p>워크플로 순서도(업무를 잇는 플로우 시각화)</p>
    </StepScaffold>
  );
}
