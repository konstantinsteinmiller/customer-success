import { Ref, ref, watch } from 'vue'

export const useWidgetOrder = (dataList: Ref<any[]>, storageKey: string) => {
  /* load the widget sorting order by key from the localStorage if available */
  const sortingOrder = localStorage.getItem(storageKey)
  const widgetsList = ref([])
  const widgetSortOrder: Ref<string[]> = ref((sortingOrder && JSON.parse(sortingOrder)) || [])

  watch(dataList, () => {
    /* if a sorting order is available pick items from the original sorted list and assign it to widgetsList */
    widgetsList.value = widgetSortOrder.value?.length
      ? widgetSortOrder.value.reduce((acc, cur, index) => {
          acc[index] = dataList.value.find(item => item.id === cur)
          return acc
        }, [])
      : dataList.value.slice(0)
  })

  watch(widgetsList, () => {
    /* save to localStorage whenever the user changes the widget order with <draggable> */
    widgetSortOrder.value = widgetsList.value.map(item => item.id)
    localStorage.setItem(storageKey, JSON.stringify(widgetSortOrder.value))
  })

  return {
    widgetsList,
  }
}
