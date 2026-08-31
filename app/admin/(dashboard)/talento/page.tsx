import { listarTalentosAction } from "@/app/actions/talento";
import GestionTalento from "@/components/admin/GestionTalento";

export default async function PaginaTalentoAdmin() {
  const talentos = await listarTalentosAction("todos");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy mb-6">Talento Cultural</h1>
      <GestionTalento talentosIniciales={talentos} />
    </div>
  );
}