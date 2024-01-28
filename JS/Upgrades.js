class upgradeDamage {
    getName() {
        return "damage upgrade";
    }

    apply(player) {
        player.stats.damage += 1.25;
    }
}

class upgradeMaxHealth {
    getName() {
        return "max health upgrade";
    }

    apply(player) {
        player.stats.maxhealth += 50;
        player.stats.health += 15;
        if(player.stats.health > player.stats.maxhealth) player.stats.health = player.stats.maxhealth;
    }
}

class upgradeHealth {
    getName() {
        return "heal player";
    }

    apply(player) {
       player.stats.health += player.stats.maxhealth*0.5;
    }
}

class upgradeSpeed {
    getName() {
        return "speed upgrade";
    }

    apply(player) {
       player.stats.speed_mult += 0.5;
       player.stats.tear_speed += 0.5;
    }
}

class upgradeBones {
    getName() {
        return "upgrade bones fire rate and size";
    }

    apply(player) {
        player.stats.tear_mult += 0.35;
        player.stats.tear_size *= 1.15;
    }
}

class upgradeBonesLongivity {
    getName() {
        return "bones properties upgrade";
    }

    apply(player) {
        player.stats.tear_persistence += 1;
        player.stats.tear_long += 500;
    }
}

class upgradeExperienceGain {
    getName() {
        return "increased experience gain";
    }

    apply(player) {
        player.stats.xp_mult += 0.4;
    }
}

class upgradeDamageReduction {
    getName() {
        return "10% damage reduction";
    }

    apply(player) {
        if(player.stats.dmg_reduction >= 0.4) {
            player.stats.health += player.stats.maxhealth*0.2;
        } else {
            player.stats.dmg_reduction += 0.1;
        }
    }
}

