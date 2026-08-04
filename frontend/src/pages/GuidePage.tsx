import { StepScaffold } from "../components/StepScaffold";

export default function GuidePage() {
  return (
    <StepScaffold
      step={4}
      title="가이드"
      summary="승인 AI 목록 안에서 업무별 활용 방법을 안내합니다."
      comingIn="Phase 3"
      prev="/verdict"
      next="/assign"
      nextLabel="다음: 분배"
    >
      <p>업무별 「무엇을 · 어떤 AI로 · 어떻게」 가이드 카드</p>
      <p>우측 승인 AI 고정 영역과 연동</p>
    </StepScaffold>
  );
}
