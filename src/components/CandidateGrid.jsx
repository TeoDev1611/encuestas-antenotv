import React from 'react';
import CandidateCard from './CandidateCard';

export default function CandidateGrid({
  candidatos,
  onVote,
  isVoting,
  isExpired,
  selectedCandidateId,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {candidatos.map((candidato) => (
          <CandidateCard
            key={candidato.id}
            candidato={candidato}
            onVote={onVote}
            isVoting={isVoting}
            isExpired={isExpired}
            selectedCandidateId={selectedCandidateId}
          />
        ))}
      </div>
    </div>
  );
}
