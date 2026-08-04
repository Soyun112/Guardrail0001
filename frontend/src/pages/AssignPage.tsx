import { StepScaffold } from "../components/StepScaffold";

export default function AssignPage() {
  return (
    <StepScaffold
      step={5}
      title="분배"
      summary="팀장이 성향을 보고 업무 카드를 팀원 컬럼으로 드래그합니다."
      comingIn="Phase 4"
      prev="/guide"
      next="/result"
      nextLabel="다음: 결과"
    >
      <p>팀원 A(꼼꼼·분석) · B(창의·기획) · C(빠름·실행)</p>
      <p>@dnd-kit 드래그앤드롭 · 「분배는 팀장(사람) 몫」 안내</p>
    </StepScaffold>
  );
}
