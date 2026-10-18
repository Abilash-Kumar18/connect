import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConnect } from '../context/ConnectContext';
import { ChatPane } from '../components/ChatPane';

interface ChannelPageProps {
  onOpenExpenseModal: () => void;
  onOpenMeetingModal: () => void;
  onOpenSummaryModal: () => void;
  onOpenNewChannelModal: () => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({
  onOpenExpenseModal,
  onOpenMeetingModal,
  onOpenSummaryModal,
  onOpenNewChannelModal,
}) => {
  const { channelId } = useParams<{ channelId?: string }>();
  const { channels, activeChannelId, setActiveChannelId } = useConnect();
  const navigate = useNavigate();

  useEffect(() => {
    if (channelId) {
      const channelExists = channels.some((c) => c.id === channelId);
      if (channelExists) {
        if (activeChannelId !== channelId) {
          setActiveChannelId(channelId);
        }
      } else if (channels.length > 0) {
        // Channel ID from URL doesn't exist, redirect to active or first channel
        const fallbackId = channels[0].id;
        navigate(`/channels/${fallbackId}`, { replace: true });
      }
    } else if (activeChannelId) {
      // No channelId in URL (e.g. /channels), redirect to activeChannelId
      navigate(`/channels/${activeChannelId}`, { replace: true });
    }
  }, [channelId, channels, activeChannelId, setActiveChannelId, navigate]);

  return (
    <ChatPane
      onOpenExpenseModal={onOpenExpenseModal}
      onOpenMeetingModal={onOpenMeetingModal}
      onOpenSummaryModal={onOpenSummaryModal}
      onOpenNewChannelModal={onOpenNewChannelModal}
    />
  );
};
