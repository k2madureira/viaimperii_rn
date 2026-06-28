import React, { useRef, useState } from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FilterIcon from '../../../../components/icons/filter';
import { MissionDifficulty } from '../../../../api/missions/missionsApi';

interface Props {
  value: MissionDifficulty | null;
  onChange: (difficulty: MissionDifficulty | null) => void;
}

const DIFFICULTY_COLOR: Record<MissionDifficulty, string> = {
  easy: '#2F7A52',
  medium: '#D4AF37',
  hard: '#9E1B32',
};

const OPTIONS: MissionDifficulty[] = ['easy', 'medium', 'hard'];

export default function DifficultyFilter({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);
  const active = value !== null;

  const open = () => {
    buttonRef.current?.measureInWindow((_x, y, _w, h) => {
      setAnchor({ top: y + h + 6, right: 20 });
      setVisible(true);
    });
  };

  const close = () => setVisible(false);

  const select = (next: MissionDifficulty | null) => {
    onChange(next);
    close();
  };

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        activeOpacity={0.8}
        onPress={visible ? close : open}
        className={`w-9 h-9 rounded-full items-center justify-center border ${
          active ? 'bg-primary-500 border-primary-500' : 'bg-white border-[#e0e0e0]'
        }`}>
        <FilterIcon size={16} color={active ? '#fff' : '#666'} />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
        <TouchableWithoutFeedback onPress={close}>
          <View className="flex-1">
            <View
              className="absolute bg-white rounded-[12px] py-1 min-w-[170px]"
              style={{
                top: anchor.top,
                right: anchor.right,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
              }}>
              <Text className="px-4 py-2 text-[10px] font-bold text-[#aaa] uppercase tracking-[1px]">
                {t('difficultyFilter.title')}
              </Text>

              <TouchableOpacity
                className="px-4 py-2.5 flex-row items-center justify-between"
                activeOpacity={0.7}
                onPress={() => select(null)}>
                <Text className="text-[13px] font-medium text-[#111]">{t('difficultyFilter.all')}</Text>
                {value === null && <Text className="text-[13px] font-bold text-primary-500">✓</Text>}
              </TouchableOpacity>

              {OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  className="px-4 py-2.5 flex-row items-center justify-between"
                  activeOpacity={0.7}
                  onPress={() => select(opt)}>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: DIFFICULTY_COLOR[opt] }}
                    />
                    <Text className="text-[13px] font-medium text-[#111]">
                      {t(`missionItem.difficulty.${opt}`)}
                    </Text>
                  </View>
                  {value === opt && <Text className="text-[13px] font-bold text-primary-500">✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
