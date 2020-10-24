import React, { useState, useEffect } from 'react';
import { useTransition } from 'react-spring';
import { WithMe, UserAvatar } from './LiveEventElements';
import { realtimeDB } from '../../firebase';

function WithMeList({ currentProtest }) {
  const [withMeUsers, setWithMeUsers] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);

  const avatarsFadeIn = useTransition(avatars, (avatar) => avatar.id, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    config: { duration: 350 },
  });

  useEffect(() => {
    if (currentProtest?.id) {
      const withMeData = realtimeDB
        .ref('24-10-20_check_ins')
        .orderByChild('protestId')
        .equalTo(currentProtest.id)
        .limitToLast(35);

      withMeData.on('child_added', (data) => {
        const user = data.val();
        setWithMeUsers((prevState) => {
          return [{ ...user, id: data.key }, ...prevState];
        });

        if (user.picture_url) {
          setAvatars((prevState) => {
            return [...prevState, { url: user.picture_url, id: data.key }];
          });
        }
      });

      withMeData.once('value', () => setLoading(false));
    }
  }, [currentProtest]);

  if (!currentProtest) {
    return (
      <WithMe>
        <h2 style={{ textAlign: 'center' }}>עשו צ'ק אין להפגנה בשביל לראות מי מפגין איתכם</h2>
      </WithMe>
    );
  }

  if (loading) {
    return (
      <WithMe style={{ textAlign: 'center' }}>
        <p>טוען נתונים...</p>
        <img src="/icons/loading-spinner.svg" alt="" />
      </WithMe>
    );
  }

  return (
    <WithMe>
      <WithMe.ProtestInfo>
        <WithMe.ProtestInfo.Title>
          {currentProtest.displayName}, {currentProtest.streetAddress}
        </WithMe.ProtestInfo.Title>
        <WithMe.ProtestInfo.Counter>{withMeUsers.length} מפגינות ומפגינים באתר</WithMe.ProtestInfo.Counter>
      </WithMe.ProtestInfo>
      <WithMe.Avatars>
        {avatarsFadeIn.map(({ item, props, key }) => (
          <UserAvatar style={props} src={item.url} key={key} />
        ))}
      </WithMe.Avatars>
    </WithMe>
  );
}

export default WithMeList;
