import getItems from './api/db/getItems'
import getCount from './api/db/getCount'
import getShallow from './api/db/getShallow'
import deleteItems from './api/db/deleteItems'
import getItem from './api/db/getItem'
import deleteItem from './api/db/deleteItem'
import createObject from './api/db/createObject'
import modifyObject from './api/db/modifyObject'

export default function (ermInstance) {
  return {
    getItems: getItems.getMiddleware(ermInstance),
    getCount: getCount.getMiddleware(ermInstance),
    getItem: getItem.getMiddleware(ermInstance),
    getShallow: getShallow.getMiddleware(ermInstance),
    createObject: createObject.getMiddleware(ermInstance),
    modifyObject: modifyObject.getMiddleware(ermInstance),
    deleteItems: deleteItems.getMiddleware(ermInstance),
    deleteItem: deleteItem.getMiddleware(ermInstance)
  }
};

