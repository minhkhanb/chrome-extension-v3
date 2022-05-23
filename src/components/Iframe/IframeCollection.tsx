import React from 'react';

export type ProductData = {
  url: string;
  price: number;
};

interface IframeContextOptions {
  products: ProductData[];
  sendMessage: (
    iframeElement: React.RefObject<HTMLIFrameElement>,
    callback: (element: Document) => ProductData
  ) => void;
}

export const IframeContext = React.createContext<IframeContextOptions>(
  {} as IframeContextOptions
);

const IframeCollection: React.FunctionComponent = ({ children }) => {
  const [products, setProducts] = React.useState<ProductData[]>([]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const messageListener = (evt: MessageEvent) => {
      if (evt.origin !== 'https://www.amazon.com') return;

      if (evt.data !== '') {
        setProducts((products) => [...products, evt.data]);
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, []);

  React.useEffect(() => {
    console.log('999Debug products updated: ', products);
  }, [products]);

  if (location.href.indexOf('amazon.com') < 0) return null;

  const sendMessage = (
    iframeElement: React.RefObject<HTMLIFrameElement>,
    callback: (element: Document) => ProductData
  ) => {
    if (typeof window === 'undefined') return;
    if (!iframeElement.current) return;

    const iframeWindow = iframeElement.current.contentWindow;
    if (iframeWindow === null) return;

    const ifDocument = iframeWindow.document;

    if (typeof callback === 'function') {
      const data = callback(ifDocument);

      window.parent.postMessage(data, 'https://www.amazon.com/');
    }
  };

  const iframeContextValues = {
    products,
    sendMessage,
  };

  return (
    <IframeContext.Provider value={iframeContextValues}>
      {children}
    </IframeContext.Provider>
  );
};

export default IframeCollection;
