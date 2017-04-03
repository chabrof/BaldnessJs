declare class Sgj_SmartList {
  _prefixLog      :string
  items           :any[]
  cache           :any[]
  _historyTab  :any[]
  _itemIdxToCacheIdx   :number[]

  get(itemIdx :number) :Promise<any>
  alloc(itemIdx :number, bufferIdx :number) :Promise<any>
  unalloc(itemIdx :number, bufferIdx :number) :void
}


declare class Sgj_SideSmartList extends Sgj_SmartList {
  _nbItemsInLeftSideCache   :number
  _nbItemsInRightSideCache  :number
  _curItemIdx               :number
  _nbItems                  :number
  _cyclic                   :boolean
  _sideCacheOffOnce         :boolean

  _prefetchingOn            :boolean
  constructor(pItems :any[], pCacheBuffer :any[], sideCachesSize :number, rightSideCacheSize? :number, cyclic? :boolean)

  prefetchingOn() :void
  prefetchingOff() :void
  getSignedMinDistance(itemOrig :number, itemDest :number, nbItems :number, cyclic? :boolean) :number
  sideCacheOffOnce() :void
}

interface Sgj_SideSmartList {
  new(pItems :any[], pCacheBuffer :any[], sideCachesSize :number, rightSideCacheSize? :number, cyclic? :boolean) :Sgj_SideSmartList
}
