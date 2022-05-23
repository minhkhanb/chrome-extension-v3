import React from 'react';
import { IframeContext } from './IframeCollection';

interface IframeItemProps {
  url: string;
}

const IframeItem: React.FunctionComponent<IframeItemProps> = ({ url }) => {
  const { sendMessage } = React.useContext(IframeContext);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const onLoadIframe = () => {
    sendMessage(iframeRef, (iframeDocument) => {
      const price = iframeDocument.querySelector(
        '#priceblock_ourprice'
      ) as HTMLElement;

      return {
        url: iframeDocument.location.href,
        price: parseFloat(price.innerText.replace(/^\D+/g, '')),
      };
    });
  };

  return (
    <iframe
      ref={iframeRef}
      src={url}
      width={600}
      height={300}
      title="Child iFrame"
      onLoad={onLoadIframe}
    />
  );
};

export default IframeItem;
