class upgradeDamage {
    getName() {
        return "damage upgrade";
    }

    apply(player) {
        player.stats.damage += 0.75;
    }
}

class upgradeMaxHealth {
    getName() {
        return "max healh upgrade";
    }

    apply(player) {
        player.stats.maxhealth += 20;
        player.stats.health += 10;
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
       player.stats.speed_mult += 0.3;
       player.stats.tear_speed += 0.5;
    }
}

class upgradeBones {
    getName() {
        return "upgrade bones fire rate";
    }

    apply(player) {
        player.stats.tear_mult += 0.25;
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
