import React from 'react';
import styled from 'styled-components';

function formatDistance(distance) {
  if (distance > 1000) {
    return `${(distance / 1000).toFixed(1)} ק"מ ממיקומך`;
  } else {
    return `${distance} מטר ממיקומך`;
  }
}

function shareProtest(protestTitle) {
  const shareData = {
    title: 'אחד קילומטר',
    text: `אני אפגין ב${protestTitle}, הצטרפו אליי!`,
    url: 'https://1km.co.il',
  };

  navigator.share(shareData);
}

let canShare = false;
if (navigator.share) {
  canShare = true;
}

function ProtestCard({ protestInfo }) {
  const { displayName, streetAddress, distance, whatsAppLink, telegramLink, meeting_time: meetingTime } = protestInfo;
  return (
    <ProtestCardWrapper>
      <ProtestCardTitleWrapper>
        <ProtestCardTitle>{displayName}</ProtestCardTitle>
        {canShare && (
          <ProtestCardShareIcon src="/icons/share.svg" alt="" title="שיתוף ההפגנה" onClick={() => shareProtest(displayName)} />
        )}
      </ProtestCardTitleWrapper>
      <ProtestCardInfo>
        {streetAddress && (
          <ProtestCardDetail>
            <ProtestCardIcon src="/icons/location.svg" alt="" aria-hidden="true" title="מיקום ההפגנה" />
            {streetAddress}
          </ProtestCardDetail>
        )}
        {meetingTime && (
          <ProtestCardDetail>
            <ProtestCardIcon src="/icons/time.svg" alt="" aria-hidden="true" title="שעת מפגש" />
            {meetingTime}
          </ProtestCardDetail>
        )}
        <ProtestCardDetail>
          <ProtestCardIcon src="/icons/ruler.svg" alt="" aria-hidden="true" title="מרחק" />
          {formatDistance(distance)}
        </ProtestCardDetail>
      </ProtestCardInfo>
      {whatsAppLink || telegramLink ? (
        <ProtestCardGroupButton type={whatsAppLink ? 'whatsapp' : 'telegram'} href={whatsAppLink || telegramLink} target="_blank">
          קבוצת {whatsAppLink ? 'וואטסאפ' : 'טלגרם'}
        </ProtestCardGroupButton>
      ) : (
        <ProtestCardGroupButton href="https://forms.gle/xESvVCD6Q2CMXKpUA" target="_blank">
          הוספת קבוצת טלגרם/וואטסאפ
        </ProtestCardGroupButton>
      )}
    </ProtestCardWrapper>
  );
}

const ProtestCardWrapper = styled.div`
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 1px 4px 0px rgba(80, 80, 82, 0.16);
`;

const ProtestCardTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProtestCardShareIcon = styled.img`
  width: 25px;
  cursor: pointer;
  user-select: none;
`;

const ProtestCardTitle = styled.h2`
  margin: 0;
  margin-bottom: 7.5px;
  font-size: 22px;
  font-weight: 600;
`;

const ProtestCardInfo = styled.div`
  margin-bottom: 7.5px;
`;

const ProtestCardDetail = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 100;
  margin-bottom: 5px;
`;

const ProtestCardIcon = styled.img`
  width: 17.5px;
  margin-inline-end: 5px;
  user-select: none;
`;

const ProtestCardGroupButton = styled.a`
  display: block;
  max-width: 100%;
  background: ${(props) => (props.type ? (props.type.whatsapp ? '#1ED96E' : '#6AB2E4') : 'blue')};
  color: #fff;
  font-family: Simpler, sans-serif;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 4px 16px;
  border: none;
  border-radius: 3px;
`;

export default ProtestCard;
