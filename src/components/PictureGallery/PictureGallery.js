import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useStore } from '../../stores';
import styled from 'styled-components/macro';
import { Image } from 'antd';
import { getPicturesForEvent } from '../../api';

function PictureGallery({ protestId, date }) {
  const [pictures, setPictures] = useState([]);
  const history = useHistory();
  const store = useStore();

  const getPictures = async () => {
    const pictureList = await getPicturesForEvent({ protestId, date });
    setPictures(pictureList);
  };

  useEffect(() => {
    getPictures();
  }, []);

  return (
    <>
      <SectionContainer>
        <SectionTitle>תמונות מיום שבת, 31.10</SectionTitle>
        {pictures.length > 0 ? pictures.map((picture) => <ImageThumbnail src={picture.imageUrl} />) : null}
        <EditButton
          onClick={async () => {
            store.userStore.setUserProtestById(protestId);
            history.push(
              store.userStore.user
                ? `/upload-image?returnUrl=${history.location.pathname}`
                : `/sign-up?returnUrl=/upload-image?returnUrl=${history.location.pathname}`
            );
          }}
        >
          הוספת תמונה לגלרייה
        </EditButton>
      </SectionContainer>
    </>
  );
}

export default PictureGallery;

const SectionContainer = styled.div`
  width: 100%;
  padding: 35px 30px;
  margin: 20px 0;
  box-shadow: 0px 4px 10px -1px rgba(0, 0, 0, 0.15);
  background-color: white;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  gap: 5px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }
`;

const SectionTitle = styled.div`
  font-size: 16px;
  line-height: 19px;
  color: #1251f3;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  grid-column: 1 / -1;
`;

const ImageThumbnail = styled(Image)`
  width: 100%;
  height: 175px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  img {
    height: 175px;
    object-fit: cover;
  }

  @media (min-width: 1024px) {
    &:hover {
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
      transform: scale(1.075);
    }
  }
`;

const EditButton = styled.button`
  width: 100%;
  height: auto;
  margin-top: 10px;
  color: #1251f3;
  border: 1px solid #1251f3;
  box-sizing: border-box;
  font-size: 16px;
  line-height: 19px;
  padding: 6px 24px;
  background: white;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s all;
  grid-column: 1 / -1;

  &:hover {
    background-color: #6e7dff;
    color: #fff;
  }
`;
