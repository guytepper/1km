import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { realtimeDB } from '../../firebase';
import CheckInModal from '../../components/CheckInModal';
import { CheckInList, WithMeList } from './';
import { getLocalStorage, setLocalStorage } from '../../localStorage';
import { LiveEventWrapper, LiveEventHeader, LiveEventMessage, LiveCurrentView } from './LiveEventElements';

const VIEWS = {
  feed: 'liveFeed',
  pictures: 'pictureFeed',
  withMe: 'withMeFeed',
};

function renderView({ currentView, currentProtest, checkIns }) {
  switch (currentView) {
    case VIEWS.feed:
      return <CheckInList checkIns={checkIns} />;
    case VIEWS.pictures:
      return <CheckInList>Pictures!</CheckInList>;
    case VIEWS.withMe:
      return <WithMeList currentProtest={currentProtest} />;

    default:
      return 'hi!';
  }
}

function LiveEvent({ user, closeProtests, coordinates, setCoordinates, loading }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentProtest, setProtest] = useState(null);
  const [currentView, setCurrentView] = useState(VIEWS.withMe);
  const [checkIns, setCheckIns] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const { pathname } = history.location;

    if (pathname.startsWith('/live/check-in') && isModalOpen !== true) {
      setModalOpen(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    // Check if exists in localStorage
    const cachedProtest = getLocalStorage('check_in_selected_protest');

    if (currentProtest) {
      if (cachedProtest?.id !== currentProtest.id) {
        setLocalStorage('check_in_selected_protest', currentProtest);
      }
    } else {
      if (cachedProtest) setProtest(cachedProtest);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProtest]);

  useEffect(() => {
    const checkIns = realtimeDB.ref('balfur_check_ins').orderByChild('createdAt').limitToLast(10);
    checkIns.on('child_added', (data) => {
      setCheckIns((prevState) => {
        return [{ ...data.val(), id: data.key }, ...prevState];
      });
    });

    // checkIns.once('value', () => {
    //   setLoading(false);
    // });

    return () => {
      checkIns.off();
    };
  }, []);

  return (
    <>
      <LiveEventWrapper>
        <LiveEventHeader>
          <LiveEventHeader.Button selected={currentView === VIEWS.feed} onClick={() => setCurrentView(VIEWS.feed)}>
            <LiveEventHeader.Button.Icon invert={currentView === VIEWS.feed} src="/icons/israel-map.svg" />
            פיד ארצי
          </LiveEventHeader.Button>
          <LiveEventHeader.Button selected={currentView === VIEWS.pictures} onClick={() => setCurrentView(VIEWS.pictures)}>
            <LiveEventHeader.Button.Icon src="/icons/image-gallery.svg" />
            פיד תמונות
          </LiveEventHeader.Button>
          <LiveEventHeader.Button selected={currentView === VIEWS.withMe} onClick={() => setCurrentView(VIEWS.withMe)}>
            <LiveEventHeader.Button.Icon src="/icons/strike.svg" />
            מפגינים איתי
          </LiveEventHeader.Button>
        </LiveEventHeader>
        <LiveEventMessage>המידע מתעדכן בזמן אמת</LiveEventMessage>
        <LiveCurrentView>{renderView({ currentView, checkIns, currentProtest })}</LiveCurrentView>
      </LiveEventWrapper>
      {isModalOpen && (
        <CheckInModal
          isOpen={isModalOpen}
          currentProtest={currentProtest}
          setProtest={setProtest}
          setModalOpen={setModalOpen}
          closeProtests={closeProtests}
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          user={user}
          loading={loading}
        />
      )}
    </>
  );
}

export default LiveEvent;
