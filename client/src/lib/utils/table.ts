type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type SectionData = Omit<
  API.Section, // eslint-disable-line no-undef
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
export type ScheduleData = {
  id: string;
  section: SectionData;
  weekday: WeekdayShort;
  period: number;
  size: number;
}[];

export function processOverlaps(arr: ScheduleData) {
  const processed = arr.map((current) => {
    return {
      ...current,
      _overlap: arr.some(
        (item) =>
          item != current &&
          item.weekday == current.weekday &&
          item.period + item.size > current.period &&
          item.period < current.period + current.size,
      ),
      _offset: -1,
    };
  });

  for (let i = 0; i < processed.length; i++) {
    if (processed[i]._overlap == false || processed[i]._offset !== -1) continue;

    const offsetList: number[] = [];

    const mutualOverlap = processed.filter(
      (item) =>
        processed[i].id != item.id &&
        item.weekday == processed[i].weekday &&
        processed[i].period < item.period + item.size &&
        processed[i].period + processed[i].size > item.period,
    );

    mutualOverlap.forEach((item) => {
      if (item._offset !== -1) offsetList.push(item._offset);
    });

    let j = 0;

    while (offsetList.includes(j)) j++;

    processed[i]._offset = j;

    for (let k = 0; k < processed.length; k++) {
      if (processed[i].weekday != processed[k].weekday || i == k) continue;

      if (processed[i].section.subject.id == processed[k].section.subject.id) {
        processed[k]._overlap = true;
        processed[k]._offset = j;
      }
    }
  }

  return processed;
}

export type ProcessedOverlapReturnType = ReturnType<typeof processOverlaps>;
