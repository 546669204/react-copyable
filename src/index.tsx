import React from 'react';

const hasSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;

const noop = (props) => {
  return props;
};

const copyMap = new Map();

const elementTypeToComponent = (elementType) => {
  if (elementType?.$$typeof === REACT_MEMO_TYPE) {
    return elementType.type;
  }
  return elementType;
};

const getCurrentCopyable = () => {
  const selection = document.getSelection();
  let el = selection?.anchorNode;
  if (el?.nodeType === 3) {
    el = el.parentElement;
  }
  if (!el) return;
  const instanceKey = Object.keys(el).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
  if (!instanceKey) return;
  let fiberNode = el[instanceKey];
  while (fiberNode) {
    const ins = copyMap.get(elementTypeToComponent(fiberNode.elementType));
    if (ins) {
      return ins;
    }
    fiberNode = fiberNode.return;
  }
};
document.addEventListener('copy', (event) => {
  const ins = getCurrentCopyable();
  const selection = document.getSelection();
  if (ins && !selection?.toString()) {
    ins.copy(event);
    event.preventDefault();
  }
});
document.addEventListener('paste', (event) => {
  const ins = getCurrentCopyable();
  if (ins && document.activeElement === document.body) {
    ins.paste(event);
    event.preventDefault();
  }
});

const Copyable = function <T extends any>({ copy = noop, paste = noop }: {
  copy: (props: any) => void
  paste: (props: any, data: any) => void
}): (Component: T) => T {
  return function (Component: any) {
    return function C(props: any) {
      React.useEffect(() => {
        copyMap.set(C, {
          copy(event) {
            event.clipboardData.setData('text/plain', JSON.stringify(copy(props)));
          },
          paste(event) {
            paste(props, JSON.parse(event.clipboardData.getData('text')));
          },
        });
        return () => {
          copyMap.delete(C);
        };
      });
      return React.createElement(Component as any, props);
    } as T;
  };
};

export default Copyable;