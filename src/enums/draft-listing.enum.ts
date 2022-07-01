export enum DraftListingStatus {
    SendToPhotography = 'send-to-photography',
    OnHold = 'on-hold',
    PhotographyPending = 'photography-pending',
    PhotographyAssigned = 'photography-assigned',
    ProcessingPending = 'processing-pending',
    ProcessorAssigned = 'processor-assigned',
    ProcessingComplete = 'processing-complete',
    PhotographyCompleted = 'photography-completed',
}

export enum MediaIndicatorFlags {
    Grey,
    Orange,
    Blue,
    Green,
}