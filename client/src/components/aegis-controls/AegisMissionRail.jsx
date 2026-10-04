import React from 'react';
import AegisMissionNode from './AegisMissionNode';

/**
 * AegisMissionRail
 * 
 * Section 13 Mission Rail:
 * 01 BRIEF -> 02 INVESTIGATE -> 03 FUSE -> 04 MAP -> 05 UNKNOWN -> 06 EXPLAIN ->
 * 07 COMMAND -> 08 STRATEGY -> 09 SIMULATE -> 10 CHESS -> 11 DEPLOY -> 12 OUTCOME
 */
export default function AegisMissionRail({
  stages = [],
  currentStage = 'briefing',
  onSelectStage
}) {
  const currentIdx = stages.findIndex(s => s.id === currentStage);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0px',
      overflowX: 'auto',
      padding: '4px 0',
      userSelect: 'none',
      scrollbarWidth: 'none'
    }}>
      {stages.map((stg, idx) => {
        const isCurrent = stg.id === currentStage;
        const isCompleted = idx < currentIdx;
        const isUpcoming = idx > currentIdx;
        const isLast = idx === stages.length - 1;

        return (
          <AegisMissionNode
            key={stg.id}
            stage={stg}
            isCurrent={isCurrent}
            isCompleted={isCompleted}
            isUpcoming={isUpcoming}
            onClick={onSelectStage}
            isLast={isLast}
          />
        );
      })}
    </div>
  );
}
