import { StepScaffold } from "../components/StepScaffold";

export default function DecomposePage() {
  return (
    <StepScaffold
      step={2}
      title="업무도출"
      summary="프로젝트를 상위 업무로 분해한 목록을 확인합니다."
      comingIn="Phase 2"
      prev="/project"
      next="/verdict"
      nextLabel="다음: 판정"
    >
      <p>상위 업무 6개 리스트 (프리셋 하드코딩)</p>
      <p>워크플로 순서: 시장조사 → 기획 → 카피 → 디자인 → 실행 → 성과분석</p>
    </StepScaffold>
  );
}
