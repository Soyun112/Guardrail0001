import { StepScaffold } from "../components/StepScaffold";

export default function ProjectPage() {
  return (
    <StepScaffold
      step={1}
      title="프로젝트"
      summary="팀장이 캠페인·목표를 입력하면 이후 업무 분해·판정이 시작됩니다."
      comingIn="Phase 2"
      next="/decompose"
      nextLabel="다음: 업무도출"
    >
      <p>프리셋 버튼: 「여름 신제품 SNS 캠페인」</p>
      <p>자유 입력창 + Gemini 분해 (프리셋이 아닐 때만)</p>
    </StepScaffold>
  );
}
