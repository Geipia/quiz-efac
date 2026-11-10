// Export Excel des resultats d'une session (utilise SheetJS, charge via CDN).
// Colonnes : Nom, Prenom, Matricule, Score, Tout bon.
async function exportSessionXLSX(sb, session, quizTitle, className) {
  const { data: at, error } = await sb.from('attempts').select('*').eq('session_id', session.id).order('started_at');
  if (error) { alert('Erreur export : ' + error.message); return; }
  const rows = (at || []).map(a => {
    const done = a.status === 'done';
    const score = done
      ? String(a.score == null ? 0 : a.score) + ' / ' + String(a.total == null ? '?' : a.total)
      : (a.status === 'cancelled' ? 'Annule' : 'En cours');
    const toutBon = done && a.total > 0 && a.score === a.total ? 'OUI' : '';
    return {
      'Nom': a.nom || '',
      'Prenom': a.prenom || '',
      'Matricule': a.matricule || '',
      'Score': score,
      'Tout bon': toutBon
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ 'Nom': '', 'Prenom': '', 'Matricule': '', 'Score': '', 'Tout bon': '' }]);
  ws['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Resultats');
  const safe = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'session';
  const date = session.created_at ? new Date(session.created_at).toISOString().slice(0, 10) : 'export';
  XLSX.writeFile(wb, 'resultats-' + safe(quizTitle) + '-' + safe(className || 'sans-classe') + '-' + date + '.xlsx');
}
