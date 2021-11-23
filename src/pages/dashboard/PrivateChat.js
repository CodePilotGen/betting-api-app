import { useEffect } from 'react';
// material
import { Card, Container } from '@material-ui/core';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getUserList } from '../../redux/slices/user';
import { getConversations, getContacts } from '../../redux/slices/privatechat';
import { getSettingsList } from '../../redux/slices/settings';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { ChatSidebar, ChatWindow, ChatAdminMessageForm } from '../../components/_dashboard/privatechat';

// ----------------------------------------------------------------------

export default function PrivateChat() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { settingsList } = useSelector((state) => state.setting);
  const chatSettings = settingsList.find((settingRow) => settingRow.type === 'chat');

  useEffect(() => {
    dispatch(getUserList());
    dispatch(getConversations());
    dispatch(getContacts());
    dispatch(getSettingsList());
  }, [dispatch]);

  return (
    <Page title="Chat | Locals">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Private Chat"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Private Chat' }]}
        />
        <ChatAdminMessageForm chatSettings={chatSettings} />
        <Card sx={{ height: '72vh', display: 'flex' }}>
          <ChatSidebar />
          <ChatWindow />
        </Card>
      </Container>
    </Page>
  );
}
