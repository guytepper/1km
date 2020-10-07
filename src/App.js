import React, { useReducer, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Map, ProtestList, Footer, Modal, Button } from './components';
import { Admin, GroupUpdate, ProjectUpdates } from './views';
import ProjectSupportPage from './views/ProjectSupportPage';
import getDistance from 'geolib/es/getDistance';
import { validateLatLng, doUserCoordinatesEqualMapPosition } from './utils';
import styled from 'styled-components';
import firebase, { firestore } from './firebase';
import * as geofirestore from 'geofirestore';
import { DispatchContext } from './context';
import AddProtest from './views/AddProtest';

const GeoFirestore = geofirestore.initializeApp(firestore);

const initialState = {
  userCoordinates: [],
  protests: {
    close: [],
    far: [],
  },
  markers: [],
  mapPosition: [],
  mapPositionHistory: [],
  isModalOpen: true,
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'setProtests':
      return { ...state, protests: { close: action.payload.close, far: action.payload.far } };
    case 'setMarkers':
      return { ...state, markers: [...state.markers, ...action.payload] };
    case 'setMapPosition':
      return { ...state, mapPosition: action.payload };
    case 'setMapPositionHistory':
      return { ...state, mapPositionHistory: action.payload };
    case 'setModalState':
      return { ...state, isModalOpen: action.payload };
    case 'setUserCoordinates':
      return { ...state, userCoordinates: action.payload, loading: true };
    case 'setLoading':
      return { ...state, loading: action.payload };
    case 'setLoadData':
      return {
        ...state,
        protests: { close: action.payload.close, far: action.payload.far },
        markers: [...state.markers, ...action.payload.markers],
        loading: false,
      };
    default:
      throw new Error('Unexpected action');
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchProtests() {
      // TODO: Move API call outside from here
      const geocollection = GeoFirestore.collection('protests');
      const query = geocollection.near({
        center: new firebase.firestore.GeoPoint(state.mapPosition[0], state.mapPosition[1]),
        radius: 15,
      });

      try {
        const snapshot = await query.limit(30).get();
        const protests = snapshot.docs.map((doc) => {
          const { latitude, longitude } = doc.data().g.geopoint;
          const protestLatlng = [latitude, longitude];
          return {
            id: doc.id,
            latlng: protestLatlng,
            distance: getDistance(state.userCoordinates, protestLatlng),
            ...doc.data(),
          };
        });

        // Filter duplicate markers
        const filteredMarkers = protests.filter((a) => !state.markers.find((b) => b.id === a.id));
        // Set data
        dispatch({
          type: 'setLoadData',
          payload: {
            close: protests.filter((p) => p.distance <= 1000).sort((p1, p2) => p1.distance - p2.distance),
            far: protests.filter((p) => p.distance > 1000).sort((p1, p2) => p1.distance - p2.distance),
            markers: filteredMarkers,
          },
        });
      } catch (err) {
        console.log(err);
      }
    }
    if (
      state.loading &&
      // needs a better name
      doUserCoordinatesEqualMapPosition(state.userCoordinates, state.mapPosition) &&
      validateLatLng(state.mapPosition)
    )
      fetchProtests();
  }, [state.userCoordinates, state.mapPosition, state.markers]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <AppWrapper>
        <Router>
          <Header>
            <SiteLogo>
              <Link to="/" style={{ color: 'black' }}>
                קילומטר אחד
              </Link>
            </SiteLogo>
            <NavItemsWrapper>
              <NavItem to="/add-protest/">+ הוספת הפגנה</NavItem>
              <NavItem to="/support-the-project/">☆ תמיכה בפרוייקט</NavItem>
            </NavItemsWrapper>
          </Header>
          <React.Fragment>
            <Route exact path="/">
              <HomepageWrapper>
                <Map
                  coordinates={state.userCoordinates}
                  setMapPosition={(position) => {
                    dispatch({ type: 'setMapPosition', payload: position });
                  }}
                  markers={state.markers}
                />

                <ProtestListWrapper>
                  <ProtestListHead>
                    <SiteMessage to="/project-updates/1" style={{ backgroundColor: '#6ab04c' }}>
                      <span style={{ boxShadow: '0 2px 0 0 #fff', fontSize: 19 }}>מה נעשה עכשיו? עדכון פרוייקט #1</span>
                    </SiteMessage>
                    <Button
                      color="#3C4F76"
                      style={{ width: '100%', margin: '0' }}
                      onClick={() => dispatch({ type: 'setModalState', payload: true })}
                    >
                      שינוי כתובת
                    </Button>
                  </ProtestListHead>

                  <ProtestList closeProtests={state.protests.close} farProtests={state.protests.far} loading={state.loading} />
                  <Footer />
                </ProtestListWrapper>
              </HomepageWrapper>
              <Modal
                isOpen={state.isModalOpen}
                setIsOpen={(isOpen) => dispatch({ type: 'setModalState', payload: isOpen })}
                coordinates={state.userCoordinates}
                setCoordinates={(coords) => dispatch({ type: 'setUserCoordinates', payload: coords })}
              />
            </Route>
            <Route exact path="/add-protest/">
              <AddProtest initialCoords={state.userCoordinates} />
            </Route>
            <Route exact path="/admin/">
              <Admin />
            </Route>
            <Route exact path="/admin/group">
              <GroupUpdate />
            </Route>
            <Route exact path="/support-the-project/">
              <ProjectSupportPage />
            </Route>
            <Route exact path="/project-updates/1">
              <ProjectUpdates />
            </Route>
          </React.Fragment>
        </Router>
      </AppWrapper>
    </DispatchContext.Provider>
  );
}

const AppWrapper = styled.div`
  display: grid;
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 25px;
  grid-row: 1;
  background-color: #fff;
  box-shadow: inset 0 -1px 0 #e1e4e8;
`;

const SiteLogo = styled.h1`
  font-size: 26px;
`;

const NavItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 550px) {
    flex-direction: row-reverse;
    align-items: center;
  }
`;

const NavItem = styled(Link)`
  &:hover {
    color: #3498db;
  }

  &:nth-child(1) {
    margin-bottom: 3px;

    @media (min-width: 550px) {
      margin-bottom: 0;
    }
  }

  &:nth-child(2) {
    @media (min-width: 550px) {
      margin-left: 15px;
    }
  }
`;

const HomepageWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-row: 2;
  z-index: 0;

  @media (min-width: 768px) {
    grid-template-columns: 280px 1fr;
    grid-template-rows: 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 300px 1fr;
  }

  @media (min-width: 1280px) {
    grid-template-columns: 330px 1fr;
  }

  @media (min-width: 1700px) {
    grid-template-columns: 375px 1fr;
  }
`;

const SiteMessage = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70px;
  padding: 5px 10px;
  background-color: #fdcb6e;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1.3;
  text-align: center;
  color: #fff;

  @media (min-width: 768px) {
    margin: 0 -15px 10px;
  }
`;

const ProtestListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  grid-column: 1 / 2;
  grid-row: 2;

  @media (min-width: 768px) {
    grid-row: 1;
    padding: 0 15px;
    max-height: calc(100vh - 60px);
  }
`;

const ProtestListHead = styled.div`
  margin-bottom: 8px;
`;

export default App;
