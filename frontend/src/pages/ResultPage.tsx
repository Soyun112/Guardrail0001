import { StepScaffold } from "../components/StepScaffold";

export default function ResultPage() {
  return (
    <StepScaffold
      step={6}
      title="결과"
      summary="팀원별로 맡은 업무 · 활용 가이드 · 쓸 AI를 한눈에 정리합니다."
      comingIn="Phase 4"
      prev="/assign"
      next="/project"
      nextLabel="처음으로"
    >
      <p>팀원별 배정 요약 보드</p>
      <p>(선택) 🟢 업무 Gemini 실행은 Phase 5</p>
    </StepScaffold>
  );
}
