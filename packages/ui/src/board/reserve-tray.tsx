import type { UiPlayerZone as UiPlayerZoneModel } from '@gem-duel/contracts';

export const ReserveTray = ({
    reserveSlots,
}: {
    reserveSlots: UiPlayerZoneModel['reserveSlots'];
}) => {
    const occupiedCount = reserveSlots.filter((slot) => slot.occupied).length;

    return (
        <section className="gd-reserve-tray-block" aria-label="Reserve tray">
            <div className="gd-player-zone-subhead">
                <strong>Reserve</strong>
                <span className="gd-muted">
                    {occupiedCount}/{reserveSlots.length} filled
                </span>
            </div>

            <div className="gd-reserve-tray">
                {reserveSlots.map((slot) => (
                    <div
                        key={slot.slotId}
                        className={
                            slot.occupied ? 'gd-reserve-slot is-occupied' : 'gd-reserve-slot'
                        }
                    >
                        <span className="gd-reserve-slot-label">{slot.slotId}</span>
                        <strong>{slot.occupied ? 'Reserved card' : 'Open slot'}</strong>
                        <span className="gd-muted">
                            {slot.occupied ? 'Hidden from shared shell' : 'Ready for reserve'}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};
