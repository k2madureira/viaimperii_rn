import React from 'react';
import {
  GlobalSearchModal,
  LegionSelectModal,
  ProvinceSetupModal,
  TrackSelectModal,
} from '../../../../../components';
import { FeedItem } from '../../../../../api/feed';

import { useJoinLegion } from '../../../../missions/model/mutations/useJoinLegion';
import { useTracks } from '../../../../ranks/model/queries/useTracks';
import { useUpdateProvince } from '../../../model/mutations/useUpdateProvince';
import { useChooseTrack } from '../../../model/mutations/useChooseTrack';
import ChangePasswordModal from '../../modals/changePasswordModal';
import { CommentsModal } from '../../feed';
import { Legion } from '../../../../../api/legion/dto';

interface Props {
  userId?: string;
  isTemporary: boolean;
  legions: Legion[];
  province: { visible: boolean; onDismiss: () => void; onSuccess: () => void };
  track: {
    visible: boolean;
    currentTrackSlug: string | null;
    onDismiss: () => void;
    onSuccess: () => void;
  };
  legion: {
    visible: boolean;
    recommendedIds: number[];
    onDismiss: () => void;
    onSuccess: () => void;
  };
  comments: { item: FeedItem | null; onClose: () => void };
  search: { visible: boolean; onClose: () => void };
} 

// Footer da home: modais automáticos (senha → província → trilha → legião),
// comentários do feed e busca global.
export default function DashboardModals({
  userId,
  isTemporary,
  legions,
  province,
  track,
  legion,
  comments,
  search,
}: Props) {
  const updateProvinceM = useUpdateProvince(userId);
  const joinLegionM = useJoinLegion(userId);
  const chooseTrackM = useChooseTrack(userId);
  const tracksQuery = useTracks();

  return (
    <>
      {/* Modal automático para senha temporária */}
      <ChangePasswordModal visible={isTemporary} isTemporary={isTemporary} onClose={() => {}} />

      <ProvinceSetupModal
        visible={province.visible}
        pending={updateProvinceM.isPending}
        onClose={province.onDismiss}
        onConfirm={(provinceId) =>
          updateProvinceM.mutate(provinceId, { onSuccess: province.onSuccess })
        }
      />

      <TrackSelectModal
        visible={track.visible}
        tracks={tracksQuery.data ?? []}
        currentTrackSlug={track.currentTrackSlug}
        isLoading={chooseTrackM.isPending}
        onChoose={(slug) => chooseTrackM.mutate(slug, { onSuccess: track.onSuccess })}
        onClose={track.onDismiss}
      />

      <LegionSelectModal
        visible={legion.visible}
        legions={legions}
        recommendedIds={legion.recommendedIds}
        pending={joinLegionM.isPending}
        onClose={legion.onDismiss}
        onConfirm={(legionId) => joinLegionM.mutate(legionId, { onSuccess: legion.onSuccess })}
      />

      <CommentsModal item={comments.item} onClose={comments.onClose} />

      <GlobalSearchModal visible={search.visible} onClose={search.onClose} />
    </>
  );
}
