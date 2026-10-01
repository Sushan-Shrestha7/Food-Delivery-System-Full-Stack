import { Injectable } from '@nestjs/common';

/** eSewa is handled as a UI-only payment selection.
 *  No real transaction or API call is needed. */
@Injectable()
export class EsewaService {}
