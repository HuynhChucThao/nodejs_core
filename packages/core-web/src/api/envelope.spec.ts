import { isEnvelope, unwrapEnvelope } from "./envelope"

const envelope = (data: unknown) => ({
    success: true,
    statusCode: 200,
    data,
    timestamp: '2026-10-26T00:00:00.000Z',
})
describe('unwrapEnvelope', () => {
    it('bóc dât khi đúng dạng chuẩn của core-api', () => {
        expect(unwrapEnvelope(envelope({ id: 1 }))).toEqual({ id: 1 });
        expect(unwrapEnvelope(envelope([1, 2]))).toEqual([1, 2]);
    });
    it('envelope không có data (controller trả void) -> underfined', () => {
        const { data: _omit, ...noData } = envelope(null);
        expect(unwrapEnvelope(noData)).toBeUndefined()
    });
    it('KHÔNG bóc nhầm response có sẵn trường data nhưng không phải envelope', () => {
        const listResponse = { items: [1], data: [2], total: 1, page: 1, limit: 10 };
        expect(unwrapEnvelope(listResponse)).toBe(listResponse);
    });
    it('KHÔNG bóc nhầm { success: true, message } của feedback', () => {
        const fb = { success: true, message: 'Thank you' };
        expect(unwrapEnvelope(fb)).toBe(fb);
    });
    it('Giá trị không phải object được trả nguyên', () => {
        expect(unwrapEnvelope(null)).toBeNull();
        expect(unwrapEnvelope('hello')).toBe('hello');
        const arr = [1, 2];
        expect(unwrapEnvelope(arr)).toBe(arr);
    });
    it('isEnvelope từ chối envelope lỗi (success: false)', () => {
        expect(isEnvelope({ ...envelope(1), success: false })).toBe(false);
    });
})