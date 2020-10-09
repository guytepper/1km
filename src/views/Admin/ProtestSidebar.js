import React, { useEffect, useState } from 'react';
import {
  Card,
  SidebarList,
  SidebarListHead,
  SidebarListHeadTitle,
  SidebarListHeadFilters,
  SidebarListHeadFilter,
  SidebarWrapper,
  Field,
} from './components';
import { PlacesAutocomplete, Button } from '../../components';
import { fetchPendingProtests } from './utils';
import { fetchNearbyProtests } from '../../api';

const ProtestSidebar = ({ state, dispatch }) => {
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    async function fetchData() {
      let payload = {};
      if (state.protestFilter === 'pending') {
        if (state.pendingProtests.length === 0) {
          const pendingProtests = await fetchPendingProtests();
          payload = { pendingProtests };
        }
      } else if (!coordinates) {
        if (state.approvedProtests.length > 0) {
          payload = { approvedProtests: [] };
        }
      } else {
        if (state.approvedProtests.length === 0) {
          const approvedProtests = await fetchNearbyProtests(coordinates);
          payload = { approvedProtests };
        }
      }
      dispatch({ type: 'setProtests', payload });
    }
    fetchData();
  }, [state.protestFilter, state.pendingProtests, state.approvedProtests, coordinates, dispatch]);

  const protests = state.protestFilter === 'pending' ? state.pendingProtests : state.approvedProtests;

  return (
    <SidebarWrapper>
      <SidebarListHead>
        <SidebarListHeadTitle>הפגנות</SidebarListHeadTitle>
        <PlacesAutocomplete setManualAddress={setCoordinates} />
        <SidebarListHeadFilters>
          <SidebarListHeadFilter>
            <Button
              style={{ width: '120px', height: '30px', fontSize: '14px', opacity: state.protestFilter === 'pending' ? 0.5 : 1 }}
              onClick={() => dispatch({ type: 'setProtestFilter', payload: { protestFilter: 'pending' } })}
            >
              מחכה לאישור
            </Button>
          </SidebarListHeadFilter>
          <SidebarListHeadFilter>
            <Button
              style={{ width: '120px', height: '30px', fontSize: '14px', opacity: state.protestFilter === 'approved' ? 0.5 : 1 }}
              onClick={() => dispatch({ type: 'setProtestFilter', payload: { protestFilter: 'approved' } })}
            >
              מאושר
            </Button>
          </SidebarListHeadFilter>
        </SidebarListHeadFilters>
      </SidebarListHead>
      <SidebarList>
        {protests.map((protest) => (
          <Card
            active={protest.id === state.currentProtest?.id}
            onClick={() => {
              dispatch({ type: 'setCurrentProtest', payload: { currentProtest: protest } });
            }}
            key={protest.id}
          >
            <Field name="שם המקום" value={protest.displayName} />
            <Field name="כתובת" value={protest.streetAddress} />
            <Field name="שעת מפגש" value={protest.meeting_time} />
          </Card>
        ))}
      </SidebarList>
    </SidebarWrapper>
  );
};

export default ProtestSidebar;
