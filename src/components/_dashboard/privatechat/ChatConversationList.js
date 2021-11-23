import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
// material
import { List } from '@material-ui/core';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
//
import ChatConversationItem from './ChatConversationItem';
// redux
import { useSelector } from '../../../redux/store';
// hooks
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

ChatConversationList.propTypes = {
  conversations: PropTypes.object,
  isOpenSidebar: PropTypes.bool,
  activeConversationId: PropTypes.string
};

export default function ChatConversationList({ conversations, isOpenSidebar, activeConversationId, ...other }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userList } = useSelector((state) => state.user);
  const { opponentId } = useParams();
  const localUsers = userList.filter((value) => value._id !== user._id);

  const handleSelectConversation = (conversationUserId) => {
    console.log(conversationUserId);
    // let conversationKey = '';
    // const conversation = conversations.byId[conversationId];
    // if (conversation.type === 'GROUP') {
    //   conversationKey = conversation._id;
    // } else {
    //   const otherParticipant = conversation.participants.find(
    //     (participant) => participant._id !== '8864c717-587d-472a-929a-8e5f298024da-0'
    //   );
    //   conversationKey = otherParticipant.username;
    // }
    // navigate(`${PATH_DASHBOARD.chat.root}/${conversationKey}`);
    navigate(`${PATH_DASHBOARD.chat.private}/${conversationUserId}`);
  };

  return (
    <List disablePadding {...other}>
      {localUsers.map((value) => (
        <ChatConversationItem
          key={value._id}
          opponent={value}
          isOpenSidebar={isOpenSidebar}
          // conversation={conversations.byId[conversationId]}
          isSelected={opponentId === value._id}
          onSelectConversation={() => handleSelectConversation(value._id)}
        />
      ))}
    </List>
  );
}
