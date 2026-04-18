import type { UiPlayerZone as UiPlayerZoneModel } from '@gem-duel/contracts';

export const ReserveTray = ({
    reserveSlots,
}: {
    reserveSlots: UiPlayerZoneModel['reserveSlots'];
}) => (
    <div className="gd-reserve-tray" aria-label="Reserve tray">
        {reserveSlots.map((slot) => (
            <div
                key={slot.slotId}
                className={slot.occupied ? 'gd-reserve-slot is-occupied' : 'gd-reserve-slot'}
            >
                <strong>{slot.slotId}</strong>
                <span>{slot.occupied ? 'occupied' : 'empty'}</span>
            </div>
        ))}
    </div>
);
